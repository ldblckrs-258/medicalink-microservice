import { Controller, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(AssetsMaintenanceController.name);

  constructor(
    private readonly assetsService: AssetsService,
    private readonly assetsMaintenanceService: AssetsMaintenanceService,
  ) {}

  @MessagePattern('assets.create')
  async createAsset(
    @Payload() createAssetDto: CreateAssetDto,
  ): Promise<AssetResponseDto> {
    this.logger.log(
      `Creating asset for entity ${createAssetDto.entityType}:${createAssetDto.entityId}`,
    );
    return this.assetsService.createAsset(createAssetDto);
  }

  @MessagePattern('assets.get_by_id')
  async getAssetById(
    @Payload() payload: { id: string },
  ): Promise<AssetResponseDto> {
    this.logger.log(`Getting asset by id: ${payload.id}`);
    return this.assetsService.getAssetById(payload.id);
  }

  @MessagePattern('assets.get_by_public_id')
  async getAssetByPublicId(
    @Payload() payload: { publicId: string },
  ): Promise<AssetResponseDto> {
    this.logger.log(`Getting asset by publicId: ${payload.publicId}`);
    return this.assetsService.getAssetByPublicId(payload.publicId);
  }

  @MessagePattern('assets.get_list')
  async getAssets(
    @Payload() query: GetAssetsQueryDto,
  ): Promise<AssetsListResponseDto> {
    this.logger.log(`Getting assets list with query: ${JSON.stringify(query)}`);
    return this.assetsService.getAssets(query);
  }

  @MessagePattern('assets.get_by_entity')
  async getAssetsByEntity(
    @Payload() payload: { entityType: AssetEntityType; entityId: string },
  ): Promise<AssetResponseDto[]> {
    this.logger.log(
      `Getting assets for entity ${payload.entityType}:${payload.entityId}`,
    );
    return this.assetsService.getAssetsByEntity(
      payload.entityType,
      payload.entityId,
    );
  }

  @MessagePattern('assets.update')
  async updateAsset(
    @Payload() payload: { id: string; updateAssetDto: UpdateAssetDto },
  ): Promise<AssetResponseDto> {
    this.logger.log(`Updating asset: ${payload.id}`);
    return this.assetsService.updateAsset(payload.id, payload.updateAssetDto);
  }

  @MessagePattern('assets.delete')
  async deleteAsset(@Payload() payload: { id: string }): Promise<void> {
    this.logger.log(`Deleting asset: ${payload.id}`);

    // Get asset before deletion to get publicId for cleanup
    const asset = await this.assetsService.getAssetById(payload.id);

    // Delete from database
    await this.assetsService.deleteAsset(payload.id);

    // Cleanup from Cloudinary
    await this.assetsMaintenanceService.cleanupEntityAssets([asset.publicId]);
  }

  @MessagePattern('assets.delete_by_public_id')
  async deleteAssetByPublicId(
    @Payload() payload: { publicId: string },
  ): Promise<void> {
    this.logger.log(`Deleting asset by publicId: ${payload.publicId}`);

    // Delete from database
    await this.assetsService.deleteAssetByPublicId(payload.publicId);

    // Cleanup from Cloudinary
    await this.assetsMaintenanceService.cleanupEntityAssets([payload.publicId]);
  }

  @MessagePattern('assets.delete_by_entity')
  async deleteAssetsByEntity(
    @Payload() payload: { entityType: AssetEntityType; entityId: string },
  ): Promise<void> {
    this.logger.log(
      `Deleting assets for entity ${payload.entityType}:${payload.entityId}`,
    );

    // Delete from database and get publicIds for cleanup
    const publicIds = await this.assetsService.deleteAssetsByEntity(
      payload.entityType,
      payload.entityId,
    );

    // Cleanup from Cloudinary
    if (publicIds.length > 0) {
      await this.assetsMaintenanceService.cleanupEntityAssets(publicIds);
    }
  }

  @MessagePattern('assets.cleanup_orphaned')
  async cleanupOrphanedAssets(
    @Payload() payload: { publicIds: string[] },
  ): Promise<void> {
    this.logger.log(
      `Cleaning up orphaned assets: ${payload.publicIds.length} items`,
    );
    await this.assetsMaintenanceService.cleanupEntityAssets(payload.publicIds);
  }

  @MessagePattern('assets.reconcile_entity')
  async reconcileEntityAssets(
    @Payload() payload: { prevPublicIds: string[]; nextPublicIds: string[] },
  ): Promise<void> {
    this.logger.log(`Reconciling entity assets`);
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
