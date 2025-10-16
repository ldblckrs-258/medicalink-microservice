import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsMaintenanceController } from './assets-maintenance.controller';
import { AssetsService } from './assets.service';
import { AssetsMaintenanceService } from './assets-maintenance.service';
import { CloudinaryProvider } from './cloudinary.provider';

@Module({
  controllers: [AssetsController, AssetsMaintenanceController],
  providers: [CloudinaryProvider, AssetsService, AssetsMaintenanceService],
  exports: [CloudinaryProvider, AssetsService, AssetsMaintenanceService],
})
export class AssetsModule {}
