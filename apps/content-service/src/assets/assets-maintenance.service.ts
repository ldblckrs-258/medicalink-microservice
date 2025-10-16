import { Inject, Injectable, Logger } from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary';
import { CLOUDINARY } from './cloudinary.provider';

/**
 * AssetsMaintenanceService: handle cleanup/replace assets on entity lifecycle.
 */
@Injectable()
export class AssetsMaintenanceService {
  private readonly logger = new Logger(AssetsMaintenanceService.name);

  constructor(
    @Inject(CLOUDINARY) private readonly cloudinary: typeof Cloudinary,
  ) {}

  /**
   * Delete all assets by their public IDs.
   */
  async cleanupEntityAssets(publicIds: string[]): Promise<void> {
    if (!Array.isArray(publicIds) || publicIds.length === 0) return;

    const uniqueIds = Array.from(new Set(publicIds.filter(Boolean)));
    for (const publicId of uniqueIds) {
      await this.safeDestroy(publicId);
    }
  }

  /**
   * Reconcile assets during update: remove those not present anymore.
   */
  async reconcileEntityAssets(
    prevPublicIds: string[],
    nextPublicIds: string[],
  ): Promise<void> {
    const prev = new Set((prevPublicIds || []).filter(Boolean));
    const next = new Set((nextPublicIds || []).filter(Boolean));

    const removed: string[] = [];
    prev.forEach((id) => {
      if (!next.has(id)) removed.push(id);
    });

    await this.cleanupEntityAssets(removed);
  }

  /**
   * Utility: try to destroy asset with simple retry and graceful handling.
   */
  private async safeDestroy(publicId: string): Promise<void> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      try {
        const res = await this.cloudinary.uploader.destroy(publicId);
        // res = { result: 'ok' | 'not found' | 'error' }
        if (res?.result === 'ok' || res?.result === 'not found') {
          if (res.result === 'not found') {
            this.logger.warn(`Asset not found for destroy: ${publicId}`);
          }
          return;
        }
        this.logger.warn(
          `Unexpected destroy result for ${publicId}: ${res?.result}`,
        );
      } catch (error) {
        this.logger.error(
          `Destroy failed for ${publicId} (attempt ${attempt}): ${error}`,
        );
      }
    }
  }
}
