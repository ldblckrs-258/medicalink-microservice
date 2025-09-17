import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PermissionRepository } from './permission.repository';

@Controller()
export class PermissionController {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  @MessagePattern('permissions.getUserSnapshot')
  async getUserPermissionSnapshot(data: { userId: string; tenantId?: string }) {
    const { userId, tenantId = 'global' } = data;
    return this.permissionRepository.getUserPermissionSnapshot(
      userId,
      tenantId,
    );
  }

  @MessagePattern('permissions.hasPermission')
  async hasPermission(data: {
    userId: string;
    resource: string;
    action: string;
    tenantId?: string;
    context?: Record<string, any>;
  }) {
    const { userId, resource, action, tenantId = 'global', context } = data;
    return this.permissionRepository.hasPermission(
      userId,
      resource,
      action,
      tenantId,
      context,
    );
  }

  @MessagePattern('permissions.getAllPermissions')
  async getAllPermissions() {
    return this.permissionRepository.getAllPermissions();
  }

  @MessagePattern('permissions.assignUserPermission')
  async assignUserPermission(data: {
    userId: string;
    permissionId: string;
    tenantId?: string;
    effect?: 'ALLOW' | 'DENY';
    conditions?: any[];
  }) {
    const {
      userId,
      permissionId,
      tenantId = 'global',
      effect = 'ALLOW',
      conditions,
    } = data;
    return this.permissionRepository.assignUserPermission(
      userId,
      permissionId,
      tenantId,
      effect,
      conditions,
    );
  }

  @MessagePattern('permissions.revokeUserPermission')
  async revokeUserPermission(data: {
    userId: string;
    permissionId: string;
    tenantId?: string;
  }) {
    const { userId, permissionId, tenantId = 'global' } = data;
    return this.permissionRepository.revokeUserPermission(
      userId,
      permissionId,
      tenantId,
    );
  }

  @MessagePattern('permissions.assignUserToGroup')
  async assignUserToGroup(data: {
    userId: string;
    groupId: string;
    tenantId?: string;
  }) {
    const { userId, groupId, tenantId = 'global' } = data;
    return this.permissionRepository.assignUserToGroup(
      userId,
      groupId,
      tenantId,
    );
  }

  @MessagePattern('permissions.removeUserFromGroup')
  async removeUserFromGroup(data: {
    userId: string;
    groupId: string;
    tenantId?: string;
  }) {
    const { userId, groupId, tenantId = 'global' } = data;
    return this.permissionRepository.removeUserFromGroup(
      userId,
      groupId,
      tenantId,
    );
  }
}
