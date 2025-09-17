import { Module } from '@nestjs/common';
import { PermissionController } from './permission.controller';
import { PermissionManagementController } from './permission-management.controller';
import { PermissionRepository } from '../permission/permission.repository';
import { AuthVersionModule } from '../auth-version/auth-version.module';

@Module({
  imports: [AuthVersionModule],
  controllers: [PermissionController, PermissionManagementController],
  providers: [PermissionRepository],
  exports: [PermissionRepository],
})
export class PermissionModule {}
