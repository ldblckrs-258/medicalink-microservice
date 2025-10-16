import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateAssetDto,
  UpdateAssetDto,
  AssetResponseDto,
  GetAssetsQueryDto,
  AssetsListResponseDto,
  AssetEntityType,
} from '@app/contracts';
import { AssetsService } from './assets.service';
import { AssetsMaintenanceService } from './assets-maintenance.service';

@Controller()
export class AssetsMaintenanceController {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly assetsMaintenanceService: AssetsMaintenanceService,
  ) {}

  @MessagePattern('assets.create')
  async createAsset(
    @Payload() createAssetDto: CreateAssetDto,
  ): Promise<AssetResponseDto> {
    return this.assetsService.createAsset(createAssetDto);
  }

  @MessagePattern('assets.get_by_id')
  async getAssetById(
    @Payload() payload: { id: string },
  ): Promise<AssetResponseDto> {
    return this.assetsService.getAssetById(payload.id);
  }

  @MessagePattern('assets.get_by_public_id')
  async getAssetByPublicId(
    @Payload() payload: { publicId: string },
  ): Promise<AssetResponseDto> {
    return this.assetsService.getAssetByPublicId(payload.publicId);
  }

  @MessagePattern('assets.get_list')
  async getAssets(
    @Payload() query: GetAssetsQueryDto,
  ): Promise<AssetsListResponseDto> {
    return this.assetsService.getAssets(query);
  }

  @MessagePattern('assets.get_by_entity')
  async getAssetsByEntity(
    @Payload() payload: { entityType: AssetEntityType; entityId: string },
  ): Promise<AssetResponseDto[]> {
    return this.assetsService.getAssetsByEntity(
      payload.entityType,
      payload.entityId,
    );
  }

  @MessagePattern('assets.update')
  async updateAsset(
    @Payload() payload: { id: string; updateAssetDto: UpdateAssetDto },
  ): Promise<AssetResponseDto> {
    return this.assetsService.updateAsset(payload.id, payload.updateAssetDto);
  }

  @MessagePattern('assets.delete')
  async deleteAsset(@Payload() payload: { id: string }): Promise<void> {
    const asset = await this.assetsService.getAssetById(payload.id);

    await this.assetsService.deleteAsset(payload.id);

    await this.assetsMaintenanceService.cleanupEntityAssets([asset.publicId]);
  }

  @MessagePattern('assets.delete_by_public_id')
  async deleteAssetByPublicId(
    @Payload() payload: { publicId: string },
  ): Promise<void> {
    await this.assetsService.deleteAssetByPublicId(payload.publicId);

    await this.assetsMaintenanceService.cleanupEntityAssets([payload.publicId]);
  }

  @MessagePattern('assets.delete_by_entity')
  async deleteAssetsByEntity(
    @Payload() payload: { entityType: AssetEntityType; entityId: string },
  ): Promise<void> {
    const publicIds = await this.assetsService.deleteAssetsByEntity(
      payload.entityType,
      payload.entityId,
    );

    if (publicIds.length > 0) {
      await this.assetsMaintenanceService.cleanupEntityAssets(publicIds);
    }
  }

  @MessagePattern('assets.cleanup_orphaned')
  async cleanupOrphanedAssets(
    @Payload() payload: { publicIds: string[] },
  ): Promise<{ deletedDb: number; requested: number }> {
    const publicIds = Array.isArray(payload?.publicIds)
      ? payload.publicIds
      : [];

    const deletedDb =
      await this.assetsService.deleteAssetsByPublicIds(publicIds);

    try {
      await this.assetsMaintenanceService.cleanupEntityAssets(publicIds);
    } catch (_) {
      /* skip */
    }

    return { deletedDb, requested: publicIds.length };
  }

  @MessagePattern('assets.reconcile_entity')
  async reconcileEntityAssets(
    @Payload() payload: { prevPublicIds: string[]; nextPublicIds: string[] },
  ): Promise<void> {
    await this.assetsMaintenanceService.reconcileEntityAssets(
      payload.prevPublicIds,
      payload.nextPublicIds,
    );
  }

  @MessagePattern('assets.health_check')
  healthCheck(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
