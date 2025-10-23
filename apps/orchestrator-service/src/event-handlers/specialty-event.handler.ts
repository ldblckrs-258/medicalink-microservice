import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
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
 * Event handler for specialty events
 * Automatically manages assets when specialty changes
 * Enhanced with retry mechanisms and error handling
 */
@Controller()
export class SpecialtyEventHandler {
  private readonly logger = new Logger(SpecialtyEventHandler.name);
  private readonly retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffMultiplier: 2,
  };

  constructor(
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
   * Handle specialty created event with enhanced error handling
   */
  @EventPattern(ORCHESTRATOR_EVENTS.SPECIALTY_CREATED)
  async handleSpecialtyCreated(@Payload() payload: unknown) {
    const data = this.unwrapPayload<{
      specialtyId: string;
      iconAssets: string[];
      assetPublicIds: string[];
    }>(payload);

    try {
      // Create asset entities for specialty icon assets
      if (data.iconAssets && data.iconAssets.length > 0) {
        await this.createSpecialtyAssetsWithRetry(
          data.specialtyId,
          data.iconAssets,
        );

        // Invalidate asset-related caches after creation
        await this.retryWithBackoff(
          async () => {
            await this.assetCacheService.invalidateSpecialtyAssetCachesComprehensive(
              data.specialtyId,
              data.iconAssets,
            );
          },
          'asset cache invalidation',
          `specialty ${data.specialtyId}`,
        );
      }

      this.logger.log(
        `Successfully handled specialty created event for ${data.specialtyId}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Don't rethrow to prevent message reprocessing
      this.logger.error(
        `Failed to handle specialty created event for ${data.specialtyId}: ${errorMessage}`,
      );
    }
  }

  /**
   * Handle specialty updated event with enhanced error handling
   */
  @EventPattern(ORCHESTRATOR_EVENTS.SPECIALTY_UPDATED)
  async handleSpecialtyUpdated(@Payload() payload: unknown) {
    const data = this.unwrapPayload<{
      specialtyId: string;
      iconAssets: string[];
      prevIconAssets: string[];
      nextIconAssets: string[];
      assetPublicIds: string[];
    }>(payload);

    try {
      // Reconcile assets if asset changes detected
      if (data.prevIconAssets || data.nextIconAssets) {
        await this.reconcileSpecialtyAssetsWithRetry(
          data.specialtyId,
          data.prevIconAssets || [],
          data.nextIconAssets || [],
        );

        // Invalidate asset-related caches after reconciliation
        await this.retryWithBackoff(
          async () => {
            const allAssets = [
              ...(data.prevIconAssets || []),
              ...(data.nextIconAssets || []),
            ];
            await this.assetCacheService.invalidateSpecialtyAssetCachesComprehensive(
              data.specialtyId,
              allAssets,
            );
          },
          'asset cache invalidation',
          `specialty ${data.specialtyId}`,
        );
      }

      this.logger.log(
        `Successfully handled specialty updated event for ${data.specialtyId}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(
        `Failed to handle specialty updated event for ${data.specialtyId}: ${errorMessage}`,
      );
    }
  }

  /**
   * Handle specialty deleted event with enhanced error handling
   */
  @EventPattern(ORCHESTRATOR_EVENTS.SPECIALTY_DELETED)
  async handleSpecialtyDeleted(@Payload() payload: unknown) {
    const data = this.unwrapPayload<{
      specialtyId: string;
      iconAssets: string[];
      assetPublicIds: string[];
    }>(payload);

    try {
      // Delete assets associated with the specialty
      if (data.assetPublicIds && data.assetPublicIds.length > 0) {
        await this.deleteSpecialtyAssetsWithRetry(
          data.specialtyId,
          data.assetPublicIds,
        );

        // Invalidate asset-related caches after deletion
        await this.retryWithBackoff(
          async () => {
            await this.assetCacheService.invalidateSpecialtyAssetCachesComprehensive(
              data.specialtyId,
              data.assetPublicIds,
            );
          },
          'asset cache invalidation',
          `specialty ${data.specialtyId}`,
        );
      }

      this.logger.log(
        `Successfully handled specialty deleted event for ${data.specialtyId}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(
        `Failed to handle specialty deleted event for ${data.specialtyId}: ${errorMessage}`,
      );
    }
  }

  /**
   * Create asset entities for specialty with retry mechanism
   */
  private async createSpecialtyAssetsWithRetry(
    specialtyId: string,
    assetPublicIds: string[],
  ): Promise<void> {
    await this.retryWithBackoff(
      async () => {
        const createAssetPromises = assetPublicIds.map((publicId) => {
          const createAssetDto: CreateAssetDto = {
            publicId,
            entityType: AssetEntityType.SPECIALTY,
            entityId: specialtyId,
          };

          return this.assetsClientService.createAsset(createAssetDto);
        });

        await Promise.all(createAssetPromises);
        this.logger.log(
          `Created ${assetPublicIds.length} asset entities for specialty ${specialtyId}`,
        );
      },
      'asset creation',
      `specialty ${specialtyId}`,
    );
  }

  /**
   * Reconcile asset entities for specialty with retry mechanism
   */
  private async reconcileSpecialtyAssetsWithRetry(
    specialtyId: string,
    prevAssets: string[],
    nextAssets: string[],
  ): Promise<void> {
    await this.retryWithBackoff(
      async () => {
        const assetsToDelete = prevAssets.filter(
          (asset) => !nextAssets.includes(asset),
        );
        const assetsToCreate = nextAssets.filter(
          (asset) => !prevAssets.includes(asset),
        );

        // Delete removed assets
        if (assetsToDelete.length > 0) {
          await this.assetsClientService.cleanupOrphanedAssets(assetsToDelete);
          this.logger.log(
            `Deleted ${assetsToDelete.length} asset entities for specialty ${specialtyId}`,
          );
        }

        // Create new assets
        if (assetsToCreate.length > 0) {
          const createAssetPromises = assetsToCreate.map((publicId) => {
            const createAssetDto: CreateAssetDto = {
              publicId,
              entityType: AssetEntityType.SPECIALTY,
              entityId: specialtyId,
            };

            return this.assetsClientService.createAsset(createAssetDto);
          });

          await Promise.all(createAssetPromises);
          this.logger.log(
            `Created ${assetsToCreate.length} asset entities for specialty ${specialtyId}`,
          );
        }
      },
      'asset reconciliation',
      `specialty ${specialtyId}`,
    );
  }

  /**
   * Delete asset entities for specialty with retry mechanism
   */
  private async deleteSpecialtyAssetsWithRetry(
    specialtyId: string,
    assetPublicIds: string[],
  ): Promise<void> {
    await this.retryWithBackoff(
      async () => {
        await this.assetsClientService.cleanupOrphanedAssets(assetPublicIds);

        this.logger.log(
          `Deleted ${assetPublicIds.length} asset entities for specialty ${specialtyId}`,
        );
      },
      'asset deletion',
      `specialty ${specialtyId}`,
    );
  }
}
