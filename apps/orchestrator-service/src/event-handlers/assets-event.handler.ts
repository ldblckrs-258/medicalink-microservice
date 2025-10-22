import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ORCHESTRATOR_EVENTS } from '@app/contracts/patterns';
import { CacheService } from '../cache';

interface AssetEventPayload {
  id?: string;
  entityType?: string;
  entityId?: string;
  assetId?: string;
  publicId?: string;
  assetIds?: string[];
}

/**
 * Event handler for assets events
 * Handles cache invalidation and cross-service coordination for asset operations
 */
@Controller()
export class AssetsEventHandler {
  private readonly logger = new Logger(AssetsEventHandler.name);

  constructor(private readonly cacheService: CacheService) {}

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
   * Handle asset created event
   */
  @EventPattern(ORCHESTRATOR_EVENTS.ASSET_CREATED)
  async handleAssetCreated(@Payload() payload: any) {
    const unwrappedPayload = this.unwrapPayload<AssetEventPayload>(payload);
    this.logger.log(`Asset created: ${JSON.stringify(unwrappedPayload)}`);

    try {
      const { entityType, entityId } = unwrappedPayload;

      // Invalidate entity-specific cache
      if (entityType && entityId) {
        await this.cacheService.invalidate(
          `assets:entity:${entityType}:${entityId}`,
        );
      }

      // Invalidate general assets list cache
      await this.cacheService.invalidatePattern('assets:list:*');

      this.logger.log('Asset created cache invalidation completed');
    } catch (error) {
      this.logger.error(
        'Failed to invalidate cache after asset creation:',
        error,
      );
    }
  }

  /**
   * Handle asset updated event
   */
  @EventPattern(ORCHESTRATOR_EVENTS.ASSET_UPDATED)
  async handleAssetUpdated(@Payload() payload: any) {
    const unwrappedPayload = this.unwrapPayload<AssetEventPayload>(payload);
    this.logger.log(`Asset updated: ${JSON.stringify(unwrappedPayload)}`);

    try {
      const { id, entityType, entityId } = unwrappedPayload;

      // Invalidate specific asset cache
      if (id) {
        await this.cacheService.invalidate(`assets:${id}`);
      }

      // Invalidate entity-specific cache
      if (entityType && entityId) {
        await this.cacheService.invalidate(
          `assets:entity:${entityType}:${entityId}`,
        );
      }

      // Invalidate general assets list cache
      await this.cacheService.invalidatePattern('assets:list:*');

      this.logger.log('Asset updated cache invalidation completed');
    } catch (error) {
      this.logger.error(
        'Failed to invalidate cache after asset update:',
        error,
      );
    }
  }

  /**
   * Handle asset deleted event
   */
  @EventPattern(ORCHESTRATOR_EVENTS.ASSET_DELETED)
  async handleAssetDeleted(@Payload() payload: any) {
    const unwrappedPayload = this.unwrapPayload<AssetEventPayload>(payload);
    this.logger.log(`Asset deleted: ${JSON.stringify(unwrappedPayload)}`);

    try {
      const { id, entityType, entityId } = unwrappedPayload;

      // Invalidate specific asset cache
      if (id) {
        await this.cacheService.invalidate(`assets:${id}`);
      }

      // Invalidate entity-specific cache
      if (entityType && entityId) {
        await this.cacheService.invalidate(
          `assets:entity:${entityType}:${entityId}`,
        );
      }

      // Invalidate general assets list cache
      await this.cacheService.invalidatePattern('assets:list:*');

      this.logger.log('Asset deleted cache invalidation completed');
    } catch (error) {
      this.logger.error(
        'Failed to invalidate cache after asset deletion:',
        error,
      );
    }
  }

  /**
   * Handle bulk assets deleted event
   */
  @EventPattern(ORCHESTRATOR_EVENTS.ASSETS_BULK_DELETED)
  async handleAssetsBulkDeleted(@Payload() payload: any) {
    const unwrappedPayload = this.unwrapPayload<AssetEventPayload>(payload);
    this.logger.log(`Assets bulk deleted: ${JSON.stringify(unwrappedPayload)}`);

    try {
      const { entityType, entityId, assetIds } = unwrappedPayload;

      // Invalidate specific asset caches
      if (assetIds && Array.isArray(assetIds)) {
        for (const assetId of assetIds) {
          await this.cacheService.invalidate(`assets:${assetId}`);
        }
      }

      // Invalidate entity-specific cache
      if (entityType && entityId) {
        await this.cacheService.invalidate(
          `assets:entity:${entityType}:${entityId}`,
        );
      }

      // Invalidate general assets list cache
      await this.cacheService.invalidatePattern('assets:list:*');

      this.logger.log('Assets bulk deleted cache invalidation completed');
    } catch (error) {
      this.logger.error(
        'Failed to invalidate cache after bulk asset deletion:',
        error,
      );
    }
  }
}
