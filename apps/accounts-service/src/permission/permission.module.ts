import { Module } from '@nestjs/common';
import { PermissionController } from './permission.controller';
import { PermissionManagementController } from './permission-management.controller';
import { PermissionRepository } from '../permission/permission.repository';
import { PermissionAssignmentService } from './permission-assignment.service';
import { AuthVersionModule } from '../auth-version/auth-version.module';

@Module({
  imports: [AuthVersionModule],
  controllers: [PermissionController, PermissionManagementController],
  providers: [PermissionRepository, PermissionAssignmentService],
  exports: [PermissionRepository, PermissionAssignmentService],
})
export class PermissionModule {}
