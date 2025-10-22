import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { DoctorCompositeService } from '../read-composition';
import { AssetsClientService } from '../clients';
import { AssetCacheService } from '../cache/asset-cache.service';
import { ORCHESTRATOR_EVENTS } from '@app/contracts/patterns';
import { AssetEntityType, CreateAssetDto } from '@app/contracts';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

/**
 * Event handler for doctor profile events
 * Automatically invalidates cache and manages assets when doctor profile changes
 * Enhanced with retry mechanisms and error handling
 */
@Controller()
export class DoctorEventHandler {
  private readonly logger = new Logger(DoctorEventHandler.name);
  private readonly retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffMultiplier: 2,
  };

  constructor(
    private readonly doctorCompositeService: DoctorCompositeService,
    private readonly assetsClientService: AssetsClientService,
    private readonly assetCacheService: AssetCacheService,
  ) {}

  // Helper to unwrap enveloped payloads
  private unwrapPayload<T>(payload: unknown): T {
    if (
      payload &&
      typeof payload === 'object' &&
      'timestamp' in (payload as any) &&
      'data' in (payload as any)
    ) {
      return (payload as any).data as T;
    }
    return payload as T;
  }

  /**
   * Retry mechanism with exponential backoff
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName: string,
    context: string,
  ): Promise<T> {
    let lastError: Error = new Error('Operation failed');

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.min(
            this.retryConfig.baseDelay *
              Math.pow(this.retryConfig.backoffMultiplier, attempt - 1),
            this.retryConfig.maxDelay,
          );

          await this.sleep(delay);
        }

        const result = await operation();

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === this.retryConfig.maxRetries) {
          this.logger.error(
            `${operationName} failed for ${context} after ${attempt} retries: ${lastError.message}`,
            lastError.stack,
          );
          break;
        }

        this.logger.warn(
          `${operationName} failed for ${context} (attempt ${attempt + 1}/${this.retryConfig.maxRetries + 1}): ${lastError.message}`,
        );
      }
    }

    throw lastError;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Handle doctor profile created event with enhanced error handling
   */
  @EventPattern(ORCHESTRATOR_EVENTS.DOCTOR_PROFILE_CREATED)
  async handleDoctorProfileCreated(@Payload() payload: unknown) {
    const data = this.unwrapPayload<{
      staffAccountId: string;
      profileId: string;
      assets: string[];
    }>(payload);

    try {
      // Invalidate cache
      await this.retryWithBackoff(
        async () => {
          await this.doctorCompositeService.invalidateDoctorCache(
            data.staffAccountId,
          );
          await this.doctorCompositeService.invalidateDoctorListCache();
        },
        'cache invalidation',
        `profile ${data.profileId}`,
      );

      // Create asset entities for doctor profile assets
      if (data.assets && data.assets.length > 0) {
        await this.createDoctorAssetsWithRetry(data.profileId, data.assets);

        // Invalidate asset-related caches after creation
        await this.retryWithBackoff(
          async () => {
            await this.assetCacheService.invalidateDoctorAssetCachesComprehensive(
              data.profileId,
              data.assets,
            );
          },
          'asset cache invalidation',
          `profile ${data.profileId}`,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Don't rethrow to prevent message reprocessing
      this.logger.error(
        `Failed to handle doctor profile created event for ${data.profileId}: ${errorMessage}`,
      );
    }
  }

  /**
   * Handle doctor profile updated event with enhanced error handling
   */
  @EventPattern(ORCHESTRATOR_EVENTS.DOCTOR_PROFILE_UPDATED)
  async handleDoctorProfileUpdated(@Payload() payload: unknown) {
    const data = this.unwrapPayload<{
      staffAccountId: string;
      profileId: string;
      prevAssets: string[];
      nextAssets: string[];
    }>(payload);

    try {
      // Invalidate cache
      await this.retryWithBackoff(
        async () => {
          await this.doctorCompositeService.invalidateDoctorCache(
            data.staffAccountId,
          );
          await this.doctorCompositeService.invalidateDoctorListCache();
        },
        'cache invalidation',
        `profile ${data.profileId}`,
      );

      // Reconcile assets if asset changes detected
      if (data.prevAssets || data.nextAssets) {
        await this.reconcileDoctorAssetsWithRetry(
          data.profileId,
          data.prevAssets || [],
          data.nextAssets || [],
        );

        // Invalidate asset-related caches after reconciliation
        await this.retryWithBackoff(
          async () => {
            const allAssets = [
              ...(data.prevAssets || []),
              ...(data.nextAssets || []),
            ];
            await this.assetCacheService.invalidateDoctorAssetCachesComprehensive(
              data.profileId,
              allAssets,
            );
          },
          'asset cache invalidation',
          `profile ${data.profileId}`,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(
        `Failed to handle doctor profile updated event for ${data.profileId}: ${errorMessage}`,
      );
    }
  }

  /**
   * Handle doctor profile deleted event with enhanced error handling
   */
  @EventPattern(ORCHESTRATOR_EVENTS.DOCTOR_PROFILE_DELETED)
  async handleDoctorProfileDeleted(@Payload() payload: unknown) {
    const data = this.unwrapPayload<{
      staffAccountId?: string;
      profileId: string;
      assetPublicIds: string[];
    }>(payload);

    try {
      // Invalidate cache if staffAccountId is available
      if (data.staffAccountId) {
        const staffAccountId = data.staffAccountId;
        await this.retryWithBackoff(
          async () => {
            await this.doctorCompositeService.invalidateDoctorCache(
              staffAccountId,
            );
            await this.doctorCompositeService.invalidateDoctorListCache();
          },
          'cache invalidation',
          `profile ${data.profileId}`,
        );
      }

      // Delete assets associated with the doctor profile
      if (data.assetPublicIds && data.assetPublicIds.length > 0) {
        await this.deleteDoctorAssetsWithRetry(
          data.profileId,
          data.assetPublicIds,
        );

        // Invalidate asset-related caches after deletion
        await this.retryWithBackoff(
          async () => {
            await this.assetCacheService.invalidateDoctorAssetCachesComprehensive(
              data.profileId,
              data.assetPublicIds,
            );
          },
          'asset cache invalidation',
          `profile ${data.profileId}`,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(
        `Failed to handle doctor profile deleted event for ${data.profileId}: ${errorMessage}`,
      );
    }
  }

  /**
   * Create asset entities for doctor profile (no retry - skip failures)
   */
  private async createDoctorAssetsWithRetry(
    profileId: string,
    assetPublicIds: string[],
  ): Promise<void> {
    try {
      await this.createDoctorAssets(profileId, assetPublicIds);
    } catch (error) {
      // Log error but don't re-throw to prevent retry mechanism
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Asset creation completed with some failures for profile ${profileId}: ${errorMessage}`,
      );
    }
  }

  /**
   * Create asset entities for doctor profile
   */
  private async createDoctorAssets(
    profileId: string,
    assetPublicIds: string[],
  ): Promise<void> {
    const results = await Promise.allSettled(
      assetPublicIds.map(async (publicId) => {
        const createAssetDto: CreateAssetDto = {
          publicId,
          entityType: AssetEntityType.DOCTOR,
          entityId: profileId,
          metadata: {
            createdBy: 'doctor-profile-service',
            source: 'doctor-profile-creation',
            timestamp: new Date().toISOString(),
          },
        };

        return this.assetsClientService.createAsset(createAssetDto);
      }),
    );

    // Check results and log any failures
    const failures = results
      .map((result, index) => ({ result, publicId: assetPublicIds[index] }))
      .filter(({ result }) => result.status === 'rejected');

    if (failures.length > 0) {
      const errorMessages = failures.map(({ result, publicId }) => {
        const error = (result as PromiseRejectedResult).reason;
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Check if it's a conflict error (asset already exists)
        if (
          errorMessage.includes('already exists') ||
          errorMessage.includes('409')
        ) {
          return `${publicId}: already exists (skipped)`;
        }
        return `${publicId}: ${errorMessage}`;
      });

      this.logger.warn(
        `Skipped ${failures.length}/${assetPublicIds.length} asset entities for doctor ${profileId}: ${errorMessages.join(', ')}`,
      );
    }

    const successCount = results.length - failures.length;
    this.logger.log(
      `Successfully created ${successCount}/${assetPublicIds.length} asset entities for doctor ${profileId}`,
    );
  }

  /**
   * Reconcile doctor assets with retry mechanism
   */
  private async reconcileDoctorAssetsWithRetry(
    profileId: string,
    prevAssets: string[],
    nextAssets: string[],
  ): Promise<void> {
    return this.retryWithBackoff(
      () => this.reconcileDoctorAssets(profileId, prevAssets, nextAssets),
      'asset reconciliation',
      `profile ${profileId}`,
    );
  }

  /**
   * Reconcile doctor assets (add new, remove old)
   */
  private async reconcileDoctorAssets(
    profileId: string,
    prevAssets: string[],
    nextAssets: string[],
  ): Promise<void> {
    const assetsToAdd = nextAssets.filter(
      (asset) => !prevAssets.includes(asset),
    );
    const assetsToRemove = prevAssets.filter(
      (asset) => !nextAssets.includes(asset),
    );

    const operations: Promise<void>[] = [];

    // Create new asset entities
    if (assetsToAdd.length > 0) {
      operations.push(this.createDoctorAssets(profileId, assetsToAdd));
    }

    // Remove old asset entities
    if (assetsToRemove.length > 0) {
      operations.push(
        this.assetsClientService.cleanupOrphanedAssets(assetsToRemove),
      );
    }

    if (operations.length > 0) {
      await Promise.all(operations);
    }
  }

  /**
   * Delete all assets for a doctor profile with retry mechanism
   */
  private async deleteDoctorAssetsWithRetry(
    profileId: string,
    assetPublicIds: string[],
  ): Promise<void> {
    return this.retryWithBackoff(
      () => this.deleteDoctorAssets(profileId, assetPublicIds),
      'asset deletion',
      `profile ${profileId}`,
    );
  }

  /**
   * Delete all assets for a doctor profile
   */
  private async deleteDoctorAssets(
    profileId: string,
    assetPublicIds: string[],
  ): Promise<void> {
    const operations: Promise<void>[] = [];

    // Delete assets by entity (removes from database)
    operations.push(
      this.assetsClientService.deleteAssetsByEntity(
        AssetEntityType.DOCTOR,
        profileId,
      ),
    );

    // Cleanup orphaned assets from Cloudinary
    if (assetPublicIds.length > 0) {
      operations.push(
        this.assetsClientService.cleanupOrphanedAssets(assetPublicIds),
      );
    }

    await Promise.all(operations);

    this.logger.log(`Successfully deleted all assets for doctor ${profileId}`);
  }
}
