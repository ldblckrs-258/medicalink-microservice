import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PermissionService } from './permission.service';
import type { UpdateGroupPayload } from './interfaces';
import {
  AddUserToGroupDto,
  AssignGroupPermissionDto,
  AssignUserPermissionDto,
  CreatePermissionGroupDto,
  RemoveUserFromGroupDto,
  RevokeGroupPermissionDto,
  RevokeUserPermissionDto,
} from '@app/contracts';
import {
  PERMISSION_PATTERNS,
  PERMISSION_GROUP_PATTERNS,
} from '@app/contracts/patterns';

@Controller()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  // Permission Management
  @MessagePattern(PERMISSION_PATTERNS.GET_ALL_PERMISSIONS)
  async getAllPermissions() {
    return this.permissionService.getAllPermissions();
  }

  @MessagePattern(PERMISSION_PATTERNS.GET_USER_PERMISSION_SNAPSHOT)
  async getUserPermissionSnapshot(
    @Payload() payload: { userId: string; tenantId?: string },
  ) {
    return this.permissionService.getUserPermissionSnapshot(
      payload.userId,
      payload.tenantId || 'global',
    );
  }

  @MessagePattern(PERMISSION_PATTERNS.GET_USER_PERMISSIONS)
  async getUserPermissions(
    @Payload() payload: { userId: string; tenantId?: string },
  ) {
    return this.permissionService.getUserPermissionDetails(
      payload.userId,
      payload.tenantId || 'global',
    );
  }

  @MessagePattern(PERMISSION_PATTERNS.HAS_PERMISSION)
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
    return this.permissionService.hasPermission(
      payload.userId,
      payload.resource,
      payload.action,
      payload.tenantId || 'global',
      payload.context,
    );
  }

  // User Permission Management
  @MessagePattern(PERMISSION_PATTERNS.ASSIGN_USER_PERMISSION)
  async assignUserPermission(@Payload() dto: AssignUserPermissionDto) {
    await this.permissionService.assignUserPermission(dto);
    return { success: true, message: 'User permission assigned successfully' };
  }

  @MessagePattern(PERMISSION_PATTERNS.REVOKE_USER_PERMISSION)
  async revokeUserPermission(@Payload() dto: RevokeUserPermissionDto) {
    await this.permissionService.revokeUserPermission(dto);
    return { success: true, message: 'User permission revoked successfully' };
  }

  // Group Management
  @MessagePattern(PERMISSION_GROUP_PATTERNS.GET_ALL)
  async getAllGroups(@Payload() payload: { tenantId?: string }) {
    return this.permissionService.getAllGroups(payload.tenantId);
  }

  @MessagePattern(PERMISSION_GROUP_PATTERNS.CREATE)
  async createGroup(@Payload() dto: CreatePermissionGroupDto) {
    return this.permissionService.createGroup(dto);
  }

  @MessagePattern(PERMISSION_GROUP_PATTERNS.UPDATE)
  async updateGroup(@Payload() payload: UpdateGroupPayload) {
    return this.permissionService.updateGroup(
      payload.id,
      payload.name,
      payload.description,
      payload.isActive,
      payload.tenantId || 'global',
    );
  }

  @MessagePattern(PERMISSION_GROUP_PATTERNS.DELETE)
  async deleteGroup(@Payload() payload: { groupId: string }) {
    await this.permissionService.deleteGroup(payload.groupId);
    return { success: true, message: 'Group deleted successfully' };
  }

  // User Group Management
  @MessagePattern(PERMISSION_GROUP_PATTERNS.GET_USER_GROUPS)
  async getUserGroups(
    @Payload() payload: { userId: string; tenantId?: string },
  ) {
    return this.permissionService.getUserGroups(
      payload.userId,
      payload.tenantId,
    );
  }

  @MessagePattern(PERMISSION_GROUP_PATTERNS.ADD_USER_TO_GROUP)
  async addUserToGroup(@Payload() dto: AddUserToGroupDto) {
    await this.permissionService.addUserToGroup(dto);
    return { success: true, message: 'User added to group successfully' };
  }

  @MessagePattern(PERMISSION_GROUP_PATTERNS.REMOVE_USER_FROM_GROUP)
  async removeUserFromGroup(@Payload() dto: RemoveUserFromGroupDto) {
    await this.permissionService.removeUserFromGroup(dto);
    return { success: true, message: 'User removed from group successfully' };
  }

  // Group Permission Management
  @MessagePattern(PERMISSION_GROUP_PATTERNS.GET_GROUP_PERMISSIONS)
  async getGroupPermissions(
    @Payload() payload: { groupId: string; tenantId?: string },
  ) {
    return this.permissionService.getGroupPermissions(
      payload.groupId,
      payload.tenantId,
    );
  }

  @MessagePattern(PERMISSION_GROUP_PATTERNS.ASSIGN_GROUP_PERMISSION)
  async assignGroupPermission(@Payload() dto: AssignGroupPermissionDto) {
    await this.permissionService.assignGroupPermission(dto);
    return { success: true, message: 'Group permission assigned successfully' };
  }

  @MessagePattern(PERMISSION_GROUP_PATTERNS.REVOKE_GROUP_PERMISSION)
  async revokeGroupPermission(@Payload() dto: RevokeGroupPermissionDto) {
    await this.permissionService.revokeGroupPermission(dto);
    return { success: true, message: 'Group permission revoked successfully' };
  }

  // Permission Management Stats
  @MessagePattern(PERMISSION_PATTERNS.GET_PERMISSION_STATS)
  async getPermissionStats() {
    return this.permissionService.getPermissionStats();
  }

  // Cache Management
  @MessagePattern(PERMISSION_PATTERNS.INVALIDATE_USER_PERMISSION_CACHE)
  invalidateUserPermissionCache(@Payload() payload: { userId: string }) {
    return this.permissionService.invalidateUserPermissionCache(payload.userId);
  }

  @MessagePattern(PERMISSION_PATTERNS.REFRESH_USER_PERMISSION_SNAPSHOT)
  async refreshUserPermissionSnapshot(
    @Payload() payload: { userId: string; tenantId?: string },
  ) {
    return this.permissionService.refreshUserPermissionSnapshot(
      payload.userId,
      payload.tenantId || 'global',
    );
  }
}
