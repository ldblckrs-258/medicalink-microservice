import { Injectable } from '@nestjs/common';
import { PermissionRepository } from './permission.repository';
import {
  PermissionStats,
  UserPermissionDetails,
  UserPermissionSnapshot,
} from './interfaces';
import {
  AddUserToGroupDto,
  AssignGroupPermissionDto,
  AssignUserPermissionDto,
  CreatePermissionGroupDto,
  PostResponseDto,
  RemoveUserFromGroupDto,
  RevokeGroupPermissionDto,
  RevokeUserPermissionDto,
} from '@app/contracts';
import { NotFoundError } from '@app/domain-errors';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  // Permission Management
  async getAllPermissions(): Promise<
    Array<{
      id: string;
      resource: string;
      action: string;
      description?: string;
    }>
  > {
    return this.permissionRepository.getAllPermissions();
  }

  async getUserPermissionSnapshot(
    userId: string,
    tenantId: string = 'global',
  ): Promise<UserPermissionSnapshot> {
    return this.permissionRepository.getUserPermissionSnapshot(
      userId,
      tenantId,
    );
  }

  async getUserPermissionDetails(
    userId: string,
    tenantId: string = 'global',
  ): Promise<UserPermissionDetails[]> {
    return this.permissionRepository.getUserPermissionDetails(userId, tenantId);
  }

  async hasPermission(
    userId: string,
    resource: string,
    action: string,
    tenantId: string = 'global',
    context?: Record<string, any>,
  ): Promise<boolean> {
    return this.permissionRepository.hasPermission(
      userId,
      resource,
      action,
      tenantId,
      context,
    );
  }

  // User Permission Management
  async assignUserPermission(
    dto: AssignUserPermissionDto,
  ): Promise<PostResponseDto> {
    await this.permissionRepository.assignUserPermission(
      dto.userId,
      dto.permissionId,
      dto.tenantId || 'global',
      dto.effect || 'ALLOW',
      dto.conditions,
    );
    return { success: true, message: 'Permission assigned successfully' };
  }

  async revokeUserPermission(
    dto: RevokeUserPermissionDto,
  ): Promise<PostResponseDto> {
    await this.permissionRepository.revokeUserPermission(
      dto.userId,
      dto.permissionId,
      dto.tenantId || 'global',
    );
    return { success: true, message: 'Permission revoked successfully' };
  }

  // Group Management
  async getAllGroups(tenantId?: string): Promise<
    Array<{
      id: string;
      name: string;
      description?: string;
      tenantId?: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>
  > {
    return this.permissionRepository.getAllGroups(tenantId);
  }

  async createGroup(dto: CreatePermissionGroupDto): Promise<{
    id: string;
    name: string;
    description?: string;
    tenantId?: string;
  }> {
    return this.permissionRepository.createGroup(
      dto.name,
      dto.description,
      dto.tenantId,
    );
  }

  async updateGroup(
    id: string,
    name?: string,
    description?: string,
    isActive?: boolean,
    tenantId: string = 'global',
  ): Promise<void> {
    return this.permissionRepository.updateGroup(
      id,
      name,
      description,
      isActive,
      tenantId,
    );
  }

  async deleteGroup(groupId: string): Promise<PostResponseDto> {
    await this.permissionRepository.deleteGroup(groupId);
    return { success: true, message: 'Group deleted successfully' };
  }

  // User Group Management
  async getUserGroups(
    userId: string,
    tenantId?: string,
  ): Promise<
    Array<{
      id: string;
      groupId: string;
      groupName: string;
      groupDescription?: string;
      tenantId?: string;
      createdAt: Date;
    }>
  > {
    return this.permissionRepository.getUserGroups(userId, tenantId);
  }

  async addUserToGroup(dto: AddUserToGroupDto): Promise<PostResponseDto> {
    await this.permissionRepository.assignUserToGroup(
      dto.userId,
      dto.groupId,
      dto.tenantId || 'global',
    );
    return { success: true, message: 'User added to group successfully' };
  }

  async removeUserFromGroup(
    dto: RemoveUserFromGroupDto,
  ): Promise<PostResponseDto> {
    await this.permissionRepository.removeUserFromGroup(
      dto.userId,
      dto.groupId,
      dto.tenantId || 'global',
    );
    return { success: true, message: 'User removed from group successfully' };
  }

  // Group Permission Management
  async getGroupPermissions(
    groupId: string,
    tenantId?: string,
  ): Promise<
    Array<{
      id: string;
      permissionId: string;
      resource: string;
      action: string;
      description?: string;
      effect: 'ALLOW' | 'DENY';
      conditions?: Array<{
        field: string;
        operator: 'eq' | 'ne' | 'in' | 'contains';
        value: any;
      }>;
      createdAt: Date;
    }>
  > {
    return this.permissionRepository.getGroupPermissions(groupId, tenantId);
  }

  async assignGroupPermission(
    dto: AssignGroupPermissionDto,
  ): Promise<PostResponseDto> {
    await this.permissionRepository.assignGroupPermission(
      dto.groupId,
      dto.permissionId,
      dto.tenantId || 'global',
      dto.effect || 'ALLOW',
      dto.conditions,
    );
    return { success: true, message: 'Group permission assigned successfully' };
  }

  async revokeGroupPermission(
    dto: RevokeGroupPermissionDto,
  ): Promise<PostResponseDto> {
    await this.permissionRepository.revokeGroupPermission(
      dto.groupId,
      dto.permissionId,
      dto.tenantId || 'global',
    );
    return { success: true, message: 'Group permission revoked successfully' };
  }

  // Permission Management Stats
  async getPermissionStats(): Promise<PermissionStats> {
    const [
      allPermissions,
      allGroups,
      totalUserPermissions,
      totalGroupPermissions,
      totalUserGroupMemberships,
      mostUsedPermissions,
      largestGroups,
    ] = await Promise.all([
      this.permissionRepository.getAllPermissions(),
      this.permissionRepository.getAllGroups(),
      this.permissionRepository.getTotalUserPermissions(),
      this.permissionRepository.getTotalGroupPermissions(),
      this.permissionRepository.getTotalUserGroupMemberships(),
      this.permissionRepository.getMostUsedPermissions(),
      this.permissionRepository.getLargestGroups(),
    ]);

    return {
      totalPermissions: allPermissions.length,
      totalGroups: allGroups.length,
      totalUserPermissions,
      totalGroupPermissions,
      totalUserGroupMemberships,
      mostUsedPermissions,
      largestGroups,
    };
  }

  // Cache Management
  async invalidateUserPermissionCache(
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // First, validate that the user exists
      await this.permissionRepository.validateUserExists(userId);

      // Increment auth version to invalidate cache
      await this.permissionRepository.incrementUserAuthVersion(userId);
      return {
        success: true,
        message: 'User permission cache invalidated successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        return {
          success: false,
          message: `User with ID '${userId}' not found`,
        };
      }
      return {
        success: false,
        message: 'Failed to invalidate user permission cache',
      };
    }
  }

  async refreshUserPermissionSnapshot(
    userId: string,
    tenantId: string = 'global',
  ): Promise<UserPermissionSnapshot> {
    return this.permissionRepository.getUserPermissionSnapshot(
      userId,
      tenantId,
    );
  }
}
