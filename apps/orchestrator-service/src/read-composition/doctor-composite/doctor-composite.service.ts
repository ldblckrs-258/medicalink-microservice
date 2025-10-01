import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CacheService } from '../../cache/cache.service';
import { MicroserviceClientHelper } from '../../clients';
import {
  SERVICE_PATTERNS,
  CACHE_PREFIXES,
  CACHE_TTL,
} from '../../common/constants';
import {
  DoctorCompositeQueryDto,
  DoctorCompositeResultDto,
  DoctorCompositeListResultDto,
  DoctorCompositeData,
  DoctorProfileData,
} from './dto';
import { IStaffAccount } from '@app/contracts/interfaces';

/**
 * Service for composing doctor data from multiple sources
 * Implements read composition pattern with caching
 */
@Injectable()
export class DoctorCompositeService {
  private readonly logger = new Logger(DoctorCompositeService.name);

  constructor(
    @Inject('ACCOUNTS_SERVICE')
    private readonly accountsClient: ClientProxy,
    @Inject('PROVIDER_DIRECTORY_SERVICE')
    private readonly providerClient: ClientProxy,
    private readonly cacheService: CacheService,
    private readonly clientHelper: MicroserviceClientHelper,
  ) {}

  /**
   * Get complete doctor data by staff account ID
   * Pattern: check cache → parallel fetch → merge → cache
   */
  async getDoctorComposite(
    staffAccountId: string,
    skipCache = false,
  ): Promise<DoctorCompositeResultDto> {
    const startTime = Date.now();
    const cacheKey = `${CACHE_PREFIXES.DOCTOR_COMPOSITE}${staffAccountId}`;

    this.logger.debug(
      `Getting doctor composite for staffAccountId: ${staffAccountId}`,
    );

    // Check cache first (unless skipCache is true)
    if (!skipCache) {
      const cached = await this.cacheService.get<DoctorCompositeData>(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for doctor composite: ${staffAccountId}`);
        return {
          data: cached,
          sources: [
            { service: 'accounts-service', fetched: false },
            { service: 'provider-directory-service', fetched: false },
          ],
          cache: {
            hit: true,
            ttl: CACHE_TTL.MEDIUM,
            key: cacheKey,
          },
          timestamp: new Date(),
        };
      }
    }

    this.logger.debug(`Cache miss, fetching from services...`);

    // Parallel fetch from both services
    const sources: DoctorCompositeResultDto['sources'] = [];

    const [accountResult, profileResult] = await Promise.allSettled([
      this.clientHelper.send<IStaffAccount>(
        this.accountsClient,
        SERVICE_PATTERNS.ACCOUNTS.DOCTOR_GET_BY_ID,
        staffAccountId,
        { timeoutMs: 8000 },
      ),
      this.clientHelper.send<DoctorProfileData>(
        this.providerClient,
        SERVICE_PATTERNS.PROVIDER.PROFILE_GET_BY_ACCOUNT_ID,
        { staffAccountId },
        { timeoutMs: 8000 },
      ),
    ]);

    // Process account result
    let account: IStaffAccount | null = null;
    if (accountResult.status === 'fulfilled') {
      account = accountResult.value;
      sources.push({ service: 'accounts-service', fetched: true });
    } else {
      this.logger.error(
        `Failed to fetch account: ${accountResult.reason?.message}`,
      );
      sources.push({
        service: 'accounts-service',
        fetched: false,
        error: accountResult.reason?.message,
      });
    }

    // Process profile result
    let profile: DoctorProfileData | null = null;
    if (profileResult.status === 'fulfilled') {
      profile = profileResult.value;
      sources.push({ service: 'provider-directory-service', fetched: true });
    } else {
      this.logger.error(
        `Failed to fetch profile: ${profileResult.reason?.message}`,
      );
      sources.push({
        service: 'provider-directory-service',
        fetched: false,
        error: profileResult.reason?.message,
      });
    }

    // Both must succeed to compose data
    if (!account || !profile) {
      throw new NotFoundException(
        `Doctor with staffAccountId ${staffAccountId} not found or incomplete`,
      );
    }

    // Merge data
    const compositeData = this.mergeData(account, profile);

    // Cache the result
    await this.cacheService.set(cacheKey, compositeData, CACHE_TTL.MEDIUM);

    const durationMs = Date.now() - startTime;
    this.logger.log(
      `Doctor composite fetched and cached in ${durationMs}ms for: ${staffAccountId}`,
    );

    return {
      data: compositeData,
      sources,
      cache: {
        hit: false,
        ttl: CACHE_TTL.MEDIUM,
        key: cacheKey,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Search/list doctors with filters and pagination
   */
  async searchDoctorComposites(
    query: DoctorCompositeQueryDto,
  ): Promise<DoctorCompositeListResultDto> {
    const startTime = Date.now();

    // Generate cache key from query params
    const cacheKey = this.cacheService.generateHashKey(
      CACHE_PREFIXES.DOCTOR_COMPOSITE_LIST,
      query,
    );

    this.logger.debug(`Searching doctors with query:`, query);

    // Check cache first (unless skipCache is true)
    if (!query.skipCache) {
      const cached =
        await this.cacheService.get<DoctorCompositeListResultDto>(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for doctor list search`);
        return {
          ...cached,
          cache: {
            hit: true,
            ttl: CACHE_TTL.SHORT,
            key: cacheKey,
          },
        };
      }
    }

    this.logger.debug(`Cache miss, fetching list from services...`);

    // Fetch doctors from accounts service first (to get IDs)
    const accountsResult = await this.clientHelper.send<{
      data: IStaffAccount[];
      meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>(
      this.accountsClient,
      SERVICE_PATTERNS.ACCOUNTS.DOCTOR_SEARCH,
      {
        search: query.search,
        page: query.page || 1,
        limit: query.limit || 10,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder, // Transform already converts to lowercase
      },
      { timeoutMs: 10000 },
    );

    const accounts = accountsResult.data;

    // If no accounts found, return empty result
    if (!accounts || accounts.length === 0) {
      const emptyResult: DoctorCompositeListResultDto = {
        data: [],
        pagination: accountsResult.meta || {
          page: query.page || 1,
          limit: query.limit || 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        cache: {
          hit: false,
          ttl: CACHE_TTL.SHORT,
          key: cacheKey,
        },
        timestamp: new Date(),
      };

      // Cache empty result too
      await this.cacheService.set(cacheKey, emptyResult, CACHE_TTL.SHORT);
      return emptyResult;
    }

    // Fetch profiles for all accounts in parallel
    const staffAccountIds = accounts.map((acc) => acc.id);

    const profilesResult = await this.clientHelper.send<DoctorProfileData[]>(
      this.providerClient,
      SERVICE_PATTERNS.PROVIDER.PROFILE_GET_BY_ACCOUNT_IDS,
      {
        staffAccountIds,
        specialtyIds: query.specialtyIds,
        workLocationIds: query.workLocationIds,
      },
      { timeoutMs: 12000 },
    );

    // Merge accounts with their profiles
    const compositeData: DoctorCompositeData[] = accounts
      .map((account) => {
        const profile = profilesResult.find(
          (p) => p.staffAccountId === account.id,
        );
        if (!profile) {
          this.logger.warn(
            `No profile found for account ${account.id}, skipping`,
          );
          return null;
        }
        return this.mergeData(account, profile);
      })
      .filter((item): item is DoctorCompositeData => item !== null);

    const result: DoctorCompositeListResultDto = {
      data: compositeData,
      pagination: accountsResult.meta,
      cache: {
        hit: false,
        ttl: CACHE_TTL.SHORT,
        key: cacheKey,
      },
      timestamp: new Date(),
    };

    // Cache the result
    await this.cacheService.set(cacheKey, result, CACHE_TTL.SHORT);

    const durationMs = Date.now() - startTime;
    this.logger.log(
      `Doctor composite list fetched and cached in ${durationMs}ms (${compositeData.length} items)`,
    );

    return result;
  }

  /**
   * Invalidate cache for a specific doctor
   */
  async invalidateDoctorCache(staffAccountId: string): Promise<void> {
    const cacheKey = `${CACHE_PREFIXES.DOCTOR_COMPOSITE}${staffAccountId}`;
    await this.cacheService.invalidate(cacheKey);
    this.logger.debug(`Invalidated cache for doctor: ${staffAccountId}`);
  }

  /**
   * Invalidate all doctor list caches
   */
  async invalidateDoctorListCache(): Promise<void> {
    await this.cacheService.invalidatePattern(
      `${CACHE_PREFIXES.DOCTOR_COMPOSITE_LIST}*`,
    );
    this.logger.debug(`Invalidated all doctor list caches`);
  }

  /**
   * Merge account and profile data into composite
   */
  private mergeData(
    account: IStaffAccount,
    profile: DoctorProfileData,
  ): DoctorCompositeData {
    return {
      // Account data
      id: account.id,
      fullName: account.fullName,
      email: account.email,
      phone: account.phone,
      isMale: account.isMale,
      dateOfBirth: account.dateOfBirth,
      role: 'DOCTOR',

      // Profile data
      profileId: profile.id,
      isActive: profile.isActive,
      degree: profile.degree,
      position: profile.position,
      introduction: profile.introduction,
      memberships: profile.memberships,
      awards: profile.awards,
      research: profile.research,
      trainingProcess: profile.trainingProcess,
      experience: profile.experience,
      avatarUrl: profile.avatarUrl,
      portrait: profile.portrait,

      // Relations
      specialties: profile.specialties,
      workLocations: profile.workLocations,

      // Timestamps
      accountCreatedAt: account.createdAt,
      accountUpdatedAt: account.updatedAt,
      profileCreatedAt: profile.createdAt,
      profileUpdatedAt: profile.updatedAt,
    };
  }
}
