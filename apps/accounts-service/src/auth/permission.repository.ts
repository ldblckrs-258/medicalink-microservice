import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface UserPermissionSnapshot {
  userId: string;
  tenant: string;
  version: number;
  permissions: string[]; // Array of "resource:action" strings
}

export interface PermissionCondition {
  field: string;
  operator: 'eq' | 'ne' | 'in' | 'contains';
  value: any;
}

export interface UserPermissionDetails {
  resource: string;
  action: string;
  effect: 'ALLOW' | 'DENY';
  conditions?: PermissionCondition[];
}

@Injectable()
export class PermissionRepository {
  constructor(private prisma: PrismaService) {}

  async getUserPermissionSnapshot(
    userId: string,
    tenantId: string = 'global',
  ): Promise<UserPermissionSnapshot | null> {
    try {
      // Get auth version
      const authVersion = await this.prisma.authVersion.findUnique({
        where: { userId },
      });

      if (!authVersion) {
        return null;
      }

      // Get direct user permissions
      const userPermissions = await this.prisma.userPermission.findMany({
        where: {
          userId,
          tenantId,
        },
        include: {
          permission: true,
        },
      });

      // Get group permissions
      const groupPermissions = await this.prisma.userGroup.findMany({
        where: {
          userId,
          tenantId,
        },
        include: {
          group: {
            include: {
              groupPermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      // Flatten all permissions
      const allPermissions = new Set<string>();

      // Add direct user permissions
      userPermissions.forEach((up) => {
        if (up.effect === 'ALLOW') {
          allPermissions.add(
            `${up.permission.resource}:${up.permission.action}`,
          );
        }
      });

      // Add group permissions
      groupPermissions.forEach((ug) => {
        ug.group.groupPermissions.forEach((gp) => {
          if (gp.effect === 'ALLOW') {
            allPermissions.add(
              `${gp.permission.resource}:${gp.permission.action}`,
            );
          }
        });
      });

      // Handle DENY permissions (they override ALLOW)
      userPermissions.forEach((up) => {
        if (up.effect === 'DENY') {
          allPermissions.delete(
            `${up.permission.resource}:${up.permission.action}`,
          );
        }
      });

      return {
        userId,
        tenant: tenantId,
        version: authVersion.version,
        permissions: Array.from(allPermissions),
      };
    } catch (error) {
      console.error('Error getting user permission snapshot:', error);
      return null;
    }
  }

  async getUserPermissionDetails(
    userId: string,
    tenantId: string = 'global',
  ): Promise<UserPermissionDetails[]> {
    try {
      const permissions: UserPermissionDetails[] = [];

      // Get direct user permissions
      const userPermissions = await this.prisma.userPermission.findMany({
        where: {
          userId,
          tenantId,
        },
        include: {
          permission: true,
        },
      });

      userPermissions.forEach((up) => {
        permissions.push({
          resource: up.permission.resource,
          action: up.permission.action,
          effect: up.effect,
          conditions: up.conditions
            ? (up.conditions as unknown as PermissionCondition[])
            : undefined,
        });
      });

      // Get group permissions
      const groupPermissions = await this.prisma.userGroup.findMany({
        where: {
          userId,
          tenantId,
        },
        include: {
          group: {
            include: {
              groupPermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      groupPermissions.forEach((ug) => {
        ug.group.groupPermissions.forEach((gp) => {
          permissions.push({
            resource: gp.permission.resource,
            action: gp.permission.action,
            effect: gp.effect,
            conditions: gp.conditions
              ? (gp.conditions as unknown as PermissionCondition[])
              : undefined,
          });
        });
      });

      return permissions;
    } catch (error) {
      console.error('Error getting user permission details:', error);
      return [];
    }
  }

  async hasPermission(
    userId: string,
    resource: string,
    action: string,
    tenantId: string = 'global',
    context?: Record<string, any>,
  ): Promise<boolean> {
    try {
      const permissionDetails = await this.getUserPermissionDetails(
        userId,
        tenantId,
      );

      // Find matching permissions
      const matchingPermissions = permissionDetails.filter(
        (p) => p.resource === resource && p.action === action,
      );

      if (matchingPermissions.length === 0) {
        return false;
      }

      // Check each permission with conditions
      for (const permission of matchingPermissions) {
        // DENY permissions always take precedence
        if (permission.effect === 'DENY') {
          if (this.checkConditions(permission.conditions, context)) {
            return false;
          }
        }
      }

      // Check for ALLOW permissions
      for (const permission of matchingPermissions) {
        if (permission.effect === 'ALLOW') {
          if (this.checkConditions(permission.conditions, context)) {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  private checkConditions(
    conditions?: PermissionCondition[],
    context?: Record<string, any>,
  ): boolean {
    if (!conditions || conditions.length === 0) {
      return true; // No conditions means permission applies
    }

    if (!context) {
      return false; // Conditions exist but no context provided
    }

    // All conditions must be satisfied
    return conditions.every((condition) => {
      const contextValue = context[condition.field];

      switch (condition.operator) {
        case 'eq':
          return contextValue === condition.value;
        case 'ne':
          return contextValue !== condition.value;
        case 'in':
          return (
            Array.isArray(condition.value) &&
            condition.value.includes(contextValue)
          );
        case 'contains':
          return (
            typeof contextValue === 'string' &&
            contextValue.includes(String(condition.value))
          );
        default:
          return false;
      }
    });
  }

  async getAllPermissions(): Promise<
    Array<{ resource: string; action: string; description?: string }>
  > {
    try {
      const permissions = await this.prisma.permission.findMany({
        select: {
          resource: true,
          action: true,
          description: true,
        },
        orderBy: [{ resource: 'asc' }, { action: 'asc' }],
      });

      return permissions.map((p) => ({
        resource: p.resource,
        action: p.action,
        description: p.description ?? undefined,
      }));
    } catch (error) {
      console.error('Error getting all permissions:', error);
      return [];
    }
  }

  async assignUserPermission(
    userId: string,
    permissionId: string,
    tenantId: string = 'global',
    effect: 'ALLOW' | 'DENY' = 'ALLOW',
    conditions?: PermissionCondition[],
  ): Promise<boolean> {
    try {
      await this.prisma.userPermission.upsert({
        where: {
          userId_permissionId_tenantId: {
            userId,
            permissionId,
            tenantId,
          },
        },
        update: {
          effect,
          conditions: conditions as any,
        },
        create: {
          userId,
          permissionId,
          tenantId,
          effect,
          conditions: conditions as any,
        },
      });

      // Increment auth version to invalidate cache
      await this.incrementUserAuthVersion(userId);

      return true;
    } catch (error) {
      console.error('Error assigning user permission:', error);
      return false;
    }
  }

  async revokeUserPermission(
    userId: string,
    permissionId: string,
    tenantId: string = 'global',
  ): Promise<boolean> {
    try {
      await this.prisma.userPermission.delete({
        where: {
          userId_permissionId_tenantId: {
            userId,
            permissionId,
            tenantId,
          },
        },
      });

      // Increment auth version to invalidate cache
      await this.incrementUserAuthVersion(userId);

      return true;
    } catch (error) {
      console.error('Error revoking user permission:', error);
      return false;
    }
  }

  async assignUserToGroup(
    userId: string,
    groupId: string,
    tenantId: string = 'global',
  ): Promise<boolean> {
    try {
      await this.prisma.userGroup.upsert({
        where: {
          userId_groupId_tenantId: {
            userId,
            groupId,
            tenantId,
          },
        },
        update: {},
        create: {
          userId,
          groupId,
          tenantId,
        },
      });

      // Increment auth version to invalidate cache
      await this.incrementUserAuthVersion(userId);

      return true;
    } catch (error) {
      console.error('Error assigning user to group:', error);
      return false;
    }
  }

  async removeUserFromGroup(
    userId: string,
    groupId: string,
    tenantId: string = 'global',
  ): Promise<boolean> {
    try {
      await this.prisma.userGroup.delete({
        where: {
          userId_groupId_tenantId: {
            userId,
            groupId,
            tenantId,
          },
        },
      });

      // Increment auth version to invalidate cache
      await this.incrementUserAuthVersion(userId);

      return true;
    } catch (error) {
      console.error('Error removing user from group:', error);
      return false;
    }
  }

  private async incrementUserAuthVersion(userId: string): Promise<void> {
    await this.prisma.authVersion.upsert({
      where: { userId },
      update: {
        version: {
          increment: 1,
        },
      },
      create: {
        userId,
        version: 1,
      },
    });
  }
}
