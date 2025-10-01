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

@Controller()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  // Permission Management
  @MessagePattern('permissions.getAll')
  async getAllPermissions() {
    return this.permissionService.getAllPermissions();
  }

  @MessagePattern('permissions.getUserSnapshot')
  async getUserPermissionSnapshot(
    @Payload() payload: { userId: string; tenantId?: string },
  ) {
    return this.permissionService.getUserPermissionSnapshot(
      payload.userId,
      payload.tenantId || 'global',
    );
  }

  @MessagePattern('permissions.getUserPermissions')
  async getUserPermissions(
    @Payload() payload: { userId: string; tenantId?: string },
  ) {
    return this.permissionService.getUserPermissionDetails(
      payload.userId,
      payload.tenantId || 'global',
    );
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
    return this.permissionService.hasPermission(
      payload.userId,
      payload.resource,
      payload.action,
      payload.tenantId || 'global',
      payload.context,
    );
  }

  // User Permission Management
  @MessagePattern('permissions.assignUserPermission')
  async assignUserPermission(@Payload() dto: AssignUserPermissionDto) {
    await this.permissionService.assignUserPermission(dto);
    return { success: true, message: 'User permission assigned successfully' };
  }

  @MessagePattern('permissions.revokeUserPermission')
  async revokeUserPermission(@Payload() dto: RevokeUserPermissionDto) {
    await this.permissionService.revokeUserPermission(dto);
    return { success: true, message: 'User permission revoked successfully' };
  }

  // Group Management
  @MessagePattern('permissions.getAllGroups')
  async getAllGroups(@Payload() payload: { tenantId?: string }) {
    return this.permissionService.getAllGroups(payload.tenantId);
  }

  @MessagePattern('permissions.createGroup')
  async createGroup(@Payload() dto: CreatePermissionGroupDto) {
    return this.permissionService.createGroup(dto);
  }

  @MessagePattern('permissions.updateGroup')
  async updateGroup(@Payload() payload: UpdateGroupPayload) {
    return this.permissionService.updateGroup(
      payload.id,
      payload.name,
      payload.description,
      payload.isActive,
      payload.tenantId || 'global',
    );
  }

  @MessagePattern('permissions.deleteGroup')
  async deleteGroup(@Payload() payload: { groupId: string }) {
    await this.permissionService.deleteGroup(payload.groupId);
    return { success: true, message: 'Group deleted successfully' };
  }

  // User Group Management
  @MessagePattern('permissions.getUserGroups')
  async getUserGroups(
    @Payload() payload: { userId: string; tenantId?: string },
  ) {
    return this.permissionService.getUserGroups(
      payload.userId,
      payload.tenantId,
    );
  }

  @MessagePattern('permissions.addUserToGroup')
  async addUserToGroup(@Payload() dto: AddUserToGroupDto) {
    await this.permissionService.addUserToGroup(dto);
    return { success: true, message: 'User added to group successfully' };
  }

  @MessagePattern('permissions.removeUserFromGroup')
  async removeUserFromGroup(@Payload() dto: RemoveUserFromGroupDto) {
    await this.permissionService.removeUserFromGroup(dto);
    return { success: true, message: 'User removed from group successfully' };
  }

  // Group Permission Management
  @MessagePattern('permissions.getGroupPermissions')
  async getGroupPermissions(
    @Payload() payload: { groupId: string; tenantId?: string },
  ) {
    return this.permissionService.getGroupPermissions(
      payload.groupId,
      payload.tenantId,
    );
  }

  @MessagePattern('permissions.assignGroupPermission')
  async assignGroupPermission(@Payload() dto: AssignGroupPermissionDto) {
    await this.permissionService.assignGroupPermission(dto);
    return { success: true, message: 'Group permission assigned successfully' };
  }

  @MessagePattern('permissions.revokeGroupPermission')
  async revokeGroupPermission(@Payload() dto: RevokeGroupPermissionDto) {
    await this.permissionService.revokeGroupPermission(dto);
    return { success: true, message: 'Group permission revoked successfully' };
  }

  // Permission Management Stats
  @MessagePattern('permissions.getStats')
  async getPermissionStats() {
    return this.permissionService.getPermissionStats();
  }

  // Cache Management
  @MessagePattern('permissions.invalidateUserCache')
  invalidateUserPermissionCache(@Payload() payload: { userId: string }) {
    return this.permissionService.invalidateUserPermissionCache(payload.userId);
  }

  @MessagePattern('permissions.refreshUserSnapshot')
  async refreshUserPermissionSnapshot(
    @Payload() payload: { userId: string; tenantId?: string },
  ) {
    return this.permissionService.refreshUserPermissionSnapshot(
      payload.userId,
      payload.tenantId || 'global',
    );
  }
}
