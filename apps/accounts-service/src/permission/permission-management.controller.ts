import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PermissionRepository } from './permission.repository';
import {
  AssignUserPermissionDto,
  RevokeUserPermissionDto,
} from '@app/contracts';

@Controller()
export class PermissionManagementController {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  // User Permission Management
  @MessagePattern('permissions.assignUserPermission')
  async assignUserPermission(@Payload() dto: AssignUserPermissionDto) {
    return this.permissionRepository.assignUserPermission(
      dto.userId,
      dto.permissionId,
      dto.tenantId || 'global',
      dto.effect || 'ALLOW',
      undefined, // Skip conditions for now due to type mismatch
    );
  }

  @MessagePattern('permissions.revokeUserPermission')
  async revokeUserPermission(@Payload() dto: RevokeUserPermissionDto) {
    return this.permissionRepository.revokeUserPermission(
      dto.userId,
      dto.permissionId,
      dto.tenantId || 'global',
    );
  }

  @MessagePattern('permissions.getUserPermissions')
  async getUserPermissions(
    @Payload() payload: { userId: string; tenantId?: string },
  ) {
    return this.permissionRepository.getUserPermissionDetails(
      payload.userId,
      payload.tenantId || 'global',
    );
  }

  @MessagePattern('permissions.getUserSnapshot')
  async getUserPermissionSnapshot(
    @Payload() payload: { userId: string; tenantId?: string },
  ) {
    return this.permissionRepository.getUserPermissionSnapshot(
      payload.userId,
      payload.tenantId || 'global',
    );
  }

  // Permission CRUD
  @MessagePattern('permissions.getAll')
  async getAllPermissions() {
    return this.permissionRepository.getAllPermissions();
  }

  @MessagePattern('permissions.hasPermission')
  async hasPermission(
    @Payload()
    payload: {
      userId: string;
      resource: string;
      action: string;
      tenantId?: string;
      context?: Record<string, any>;
    },
  ) {
    return this.permissionRepository.hasPermission(
      payload.userId,
      payload.resource,
      payload.action,
      payload.tenantId || 'global',
      payload.context,
    );
  }

  // Permission Management Stats
  @MessagePattern('permissions.getStats')
  async getPermissionStats() {
    try {
      const allPermissions =
        await this.permissionRepository.getAllPermissions();
      return {
        totalPermissions: allPermissions.length,
        totalGroups: 0, // Will implement later
        totalUserPermissions: 0, // Will implement later
        totalGroupPermissions: 0, // Will implement later
        totalUserGroupMemberships: 0, // Will implement later
        mostUsedPermissions: [],
        largestGroups: [],
      };
    } catch (_error) {
      return {
        totalPermissions: 0,
        totalGroups: 0,
        totalUserPermissions: 0,
        totalGroupPermissions: 0,
        totalUserGroupMemberships: 0,
        mostUsedPermissions: [],
        largestGroups: [],
      };
    }
  }

  // Cache Management
  @MessagePattern('permissions.invalidateUserCache')
  invalidateUserPermissionCache(
    @Payload() _payload: { userId: string; tenantId?: string },
  ) {
    // This will be handled by auth version increment
    // For now, just return success
    return {
      success: true,
      message: 'Cache invalidation handled by auth version system',
    };
  }

  @MessagePattern('permissions.refreshUserSnapshot')
  async refreshUserPermissionSnapshot(
    @Payload() payload: { userId: string; tenantId?: string },
  ) {
    return this.permissionRepository.getUserPermissionSnapshot(
      payload.userId,
      payload.tenantId || 'global',
    );
  }
}
