import { Injectable, Logger, Inject } from '@nestjs/common';
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
import { BaseCompositeService } from '../base';

/**
 * Service for composing doctor data from multiple sources
 * Implements read composition pattern with caching
 */
@Injectable()
export class DoctorCompositeService extends BaseCompositeService<
  DoctorCompositeData,
  DoctorCompositeQueryDto
> {
  protected readonly logger = new Logger(DoctorCompositeService.name);
  protected readonly cachePrefix = CACHE_PREFIXES.DOCTOR_COMPOSITE;
  protected readonly listCachePrefix = CACHE_PREFIXES.DOCTOR_COMPOSITE_LIST;
  protected readonly defaultCacheTtl = CACHE_TTL.MEDIUM;

  constructor(
    @Inject('ACCOUNTS_SERVICE')
    private readonly accountsClient: ClientProxy,
    @Inject('PROVIDER_DIRECTORY_SERVICE')
    private readonly providerClient: ClientProxy,
    protected readonly cacheService: CacheService,
    protected readonly clientHelper: MicroserviceClientHelper,
  ) {
    super();
  }

  /**
   * Get complete doctor data by staff account ID
   */
  async getDoctorComposite(
    staffAccountId: string,
    skipCache = false,
  ): Promise<DoctorCompositeResultDto> {
    const cacheKey = this.buildEntityCacheKey(staffAccountId);

    return this.getCompositeWithCache<IStaffAccount, DoctorProfileData>(
      staffAccountId,
      {
        source1: {
          client: this.accountsClient,
          pattern: SERVICE_PATTERNS.ACCOUNTS.DOCTOR_GET_BY_ID,
          payload: staffAccountId,
          timeoutMs: 8000,
          serviceName: 'accounts-service',
        },
        source2: {
          client: this.providerClient,
          pattern: SERVICE_PATTERNS.PROVIDER.PROFILE_GET_BY_ACCOUNT_ID,
          payload: { staffAccountId },
          timeoutMs: 8000,
          serviceName: 'provider-directory-service',
        },
        cacheKey,
        cacheTtl: CACHE_TTL.MEDIUM,
        skipCache,
      },
      (account, profile) => this.mergeData(account, profile),
    );
  }

  /**
   * Search/list doctors with filters and pagination
   */
  async searchDoctorComposites(
    query: DoctorCompositeQueryDto,
  ): Promise<DoctorCompositeListResultDto> {
    const cacheKey = this.buildListCacheKey(query);

    return this.searchCompositeWithCache<IStaffAccount, DoctorProfileData>(
      query,
      {
        primaryFetch: {
          client: this.accountsClient,
          pattern: SERVICE_PATTERNS.ACCOUNTS.DOCTOR_SEARCH,
          payload: {
            search: query.search,
            page: query.page || 1,
            limit: query.limit || 10,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
          },
          timeoutMs: 10000,
          serviceName: 'accounts-service',
        },
        secondaryFetch: (accounts: IStaffAccount[]) => ({
          client: this.providerClient,
          pattern: SERVICE_PATTERNS.PROVIDER.PROFILE_GET_BY_ACCOUNT_IDS,
          payload: {
            staffAccountIds: accounts.map((acc) => acc.id),
            specialtyIds: query.specialtyIds,
            workLocationIds: query.workLocationIds,
          },
          timeoutMs: 12000,
          serviceName: 'provider-directory-service',
        }),
        cacheKey,
        cacheTtl: CACHE_TTL.SHORT,
        skipCache: query.skipCache,
        extractIds: (accounts) => accounts.map((acc) => acc.id),
        extractMeta: (primaryResult) =>
          primaryResult.meta || {
            page: query.page || 1,
            limit: query.limit || 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
      },
      (account: IStaffAccount, profiles: DoctorProfileData[]) => {
        const profile = profiles.find((p) => p.staffAccountId === account.id);
        if (!profile) {
          this.logger.warn(
            `No profile found for account ${account.id}, skipping`,
          );
          return null;
        }
        return this.mergeData(account, profile);
      },
    );
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

  /**
   * Invalidate cache for a specific doctor
   */
  async invalidateDoctorCache(staffAccountId: string): Promise<void> {
    return this.invalidateEntityCache(staffAccountId);
  }

  /**
   * Invalidate all doctor list caches
   */
  async invalidateDoctorListCache(): Promise<void> {
    return this.invalidateListCache();
  }
}
