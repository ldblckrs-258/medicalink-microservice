import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RedisService } from '@app/redis';
import { JwtPayloadDto } from '@app/contracts';

export interface PermissionContext {
  userId?: string;
  doctorId?: string;
  locationId?: string;
  appointmentId?: string;
  [key: string]: any;
}

export interface CachedPermissionSnapshot {
  userId: string;
  tenant: string;
  version: number;
  permissions: Set<string>;
  cachedAt: number;
}

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly CACHE_KEY_PREFIX = 'permissions:';

  constructor(
    @Inject('ACCOUNTS_SERVICE') private readonly accountsClient: ClientProxy,
    private readonly redisService: RedisService,
  ) {}

  async hasPermission(
    user: JwtPayloadDto,
    resource: string,
    action: string,
    context?: PermissionContext,
  ): Promise<boolean> {
    try {
      // Get cached permission snapshot
      const permissionSnapshot = await this.getPermissionSnapshot(user);

      if (!permissionSnapshot) {
        this.logger.warn(`No permission snapshot found for user ${user.sub}`);
        return false;
      }

      // Check if user has the required permission
      const permissionKey = `${resource}:${action}`;

      if (!permissionSnapshot.permissions.has(permissionKey)) {
        this.logger.debug(
          `User ${user.email} does not have permission ${permissionKey}`,
        );
        return false;
      }

      // For context-based permissions, we need to check with the database
      // as conditions are not cached in the snapshot
      if (context && Object.keys(context).length > 0) {
        return this.checkPermissionWithContext(
          user.sub,
          resource,
          action,
          user.tenant,
          context,
        );
      }

      this.logger.debug(`User ${user.email} has permission ${permissionKey}`);
      return true;
    } catch (error) {
      this.logger.error('Error checking permission:', error);
      return false;
    }
  }

  async requirePermission(
    user: JwtPayloadDto,
    resource: string,
    action: string,
    context?: PermissionContext,
  ): Promise<void> {
    const hasPermission = await this.hasPermission(
      user,
      resource,
      action,
      context,
    );

    if (!hasPermission) {
      throw new Error(
        `Insufficient permissions. Required: ${resource}:${action}`,
      );
    }
  }

  async getPermissionSnapshot(
    user: JwtPayloadDto,
  ): Promise<CachedPermissionSnapshot | null> {
    const cacheKey = this.getCacheKey(user.sub, user.tenant, user.ver);

    try {
      // Try to get from cache first
      const cached = await this.redisService.get(cacheKey);

      if (cached) {
        const snapshot = JSON.parse(cached) as CachedPermissionSnapshot;

        // Check if version matches (cache invalidation)
        if (snapshot.version === user.ver) {
          // Convert permissions array back to Set
          snapshot.permissions = new Set(snapshot.permissions);
          return snapshot;
        } else {
          // Version mismatch, remove stale cache
          await this.redisService.del(cacheKey);
        }
      }

      // Cache miss or stale, fetch from database
      const snapshot = await this.fetchPermissionSnapshotFromDB(user);

      if (snapshot) {
        // Cache the snapshot
        await this.cachePermissionSnapshot(snapshot);
        return snapshot;
      }

      return null;
    } catch (error) {
      this.logger.error('Error getting permission snapshot:', error);
      return null;
    }
  }

  async invalidateUserPermissions(
    userId: string,
    tenant: string = 'global',
  ): Promise<void> {
    try {
      // We don't know the exact version, so we use wildcard pattern
      const pattern = `${this.CACHE_KEY_PREFIX}${userId}:${tenant}:*`;
      const keys = await this.redisService.keys(pattern);

      if (keys.length > 0) {
        // Delete keys one by one since del doesn't accept spread
        await Promise.all(keys.map((key) => this.redisService.del(key)));
        this.logger.debug(
          `Invalidated ${keys.length} permission cache entries for user ${userId}`,
        );
      }
    } catch (error) {
      this.logger.error('Error invalidating user permissions:', error);
    }
  }

  async refreshPermissionSnapshot(
    user: JwtPayloadDto,
  ): Promise<CachedPermissionSnapshot | null> {
    // Force refresh by removing cache and fetching from DB
    const cacheKey = this.getCacheKey(user.sub, user.tenant, user.ver);
    await this.redisService.del(cacheKey);

    return this.getPermissionSnapshot(user);
  }

  private async fetchPermissionSnapshotFromDB(
    user: JwtPayloadDto,
  ): Promise<CachedPermissionSnapshot | null> {
    try {
      const result = await this.accountsClient
        .send('permissions.getUserSnapshot', {
          userId: user.sub,
          tenantId: user.tenant,
        })
        .toPromise();

      if (!result) {
        return null;
      }

      return {
        userId: result.userId,
        tenant: result.tenant,
        version: result.version,
        permissions: new Set(result.permissions as string[]),
        cachedAt: Date.now(),
      };
    } catch (error) {
      this.logger.error('Error fetching permission snapshot from DB:', error);
      return null;
    }
  }

  private async checkPermissionWithContext(
    userId: string,
    resource: string,
    action: string,
    tenant: string,
    context: PermissionContext,
  ): Promise<boolean> {
    try {
      const result = await this.accountsClient
        .send('permissions.hasPermission', {
          userId,
          resource,
          action,
          tenantId: tenant,
          context,
        })
        .toPromise();

      return result || false;
    } catch (error) {
      this.logger.error('Error checking permission with context:', error);
      return false;
    }
  }

  private async cachePermissionSnapshot(
    snapshot: CachedPermissionSnapshot,
  ): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(
        snapshot.userId,
        snapshot.tenant,
        snapshot.version,
      );

      // Convert Set to Array for JSON serialization
      const cacheData = {
        ...snapshot,
        permissions: Array.from(snapshot.permissions),
      };

      await this.redisService.set(
        cacheKey,
        JSON.stringify(cacheData),
        this.CACHE_TTL,
      );

      this.logger.debug(
        `Cached permission snapshot for user ${snapshot.userId} (${snapshot.permissions.size} permissions)`,
      );
    } catch (error) {
      this.logger.error('Error caching permission snapshot:', error);
    }
  }

  private getCacheKey(userId: string, tenant: string, version: number): string {
    return `${this.CACHE_KEY_PREFIX}${userId}:${tenant}:${version}`;
  }

  // Helper methods for common permission patterns
  async canReadResource(
    user: JwtPayloadDto,
    resource: string,
    context?: PermissionContext,
  ): Promise<boolean> {
    return this.hasPermission(user, resource, 'read', context);
  }

  async canWriteResource(
    user: JwtPayloadDto,
    resource: string,
    context?: PermissionContext,
  ): Promise<boolean> {
    return this.hasPermission(user, resource, 'write', context);
  }

  async canDeleteResource(
    user: JwtPayloadDto,
    resource: string,
    context?: PermissionContext,
  ): Promise<boolean> {
    return this.hasPermission(user, resource, 'delete', context);
  }

  async canManageResource(
    user: JwtPayloadDto,
    resource: string,
    context?: PermissionContext,
  ): Promise<boolean> {
    return this.hasPermission(user, resource, 'manage', context);
  }

  // Administrative helpers
  async isSystemAdmin(user: JwtPayloadDto): Promise<boolean> {
    return this.hasPermission(user, 'system', 'admin');
  }

  async canManagePermissions(user: JwtPayloadDto): Promise<boolean> {
    return this.hasPermission(user, 'permissions', 'manage');
  }

  async canManageUsers(user: JwtPayloadDto): Promise<boolean> {
    return this.hasPermission(user, 'staff', 'manage');
  }
}
