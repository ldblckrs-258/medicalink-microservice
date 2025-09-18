import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  AssignUserPermissionDto,
  RevokeUserPermissionDto,
  RequirePermission,
  CurrentUser,
} from '@app/contracts';
import type { JwtPayloadDto } from '@app/contracts';
import { MicroserviceService } from '../utils/microservice.service';

@Controller('permissions')
export class PermissionsController {
  constructor(
    @Inject('ACCOUNTS_SERVICE') private readonly accountsClient: ClientProxy,
    private readonly microserviceService: MicroserviceService,
  ) {}

  // Get all available permissions
  @RequirePermission('permissions', 'read')
  @Get()
  async getAllPermissions() {
    return this.microserviceService.sendWithTimeout(
      this.accountsClient,
      'permissions.getAll',
      {},
    );
  }

  // Get permissions for a specific user
  @RequirePermission('permissions', 'read')
  @Get('users/:userId')
  async getUserPermissions(
    @Param('userId') userId: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.accountsClient,
      'permissions.getUserPermissions',
      { userId, tenantId },
    );
  }

  // Get current user's permissions
  @Get('me')
  async getMyPermissions(@CurrentUser() user: JwtPayloadDto) {
    return this.microserviceService.sendWithTimeout(
      this.accountsClient,
      'permissions.getUserSnapshot',
      { userId: user.sub, tenantId: user.tenant },
    );
  }

  // Assign permission to user
  @RequirePermission('permissions', 'manage')
  @Post('users/assign')
  async assignUserPermission(@Body() dto: AssignUserPermissionDto) {
    return this.microserviceService.sendWithTimeout(
      this.accountsClient,
      'permissions.assignUserPermission',
      dto,
    );
  }

  // Revoke permission from user
  @RequirePermission('permissions', 'manage')
  @Delete('users/revoke')
  async revokeUserPermission(@Body() dto: RevokeUserPermissionDto) {
    return this.microserviceService.sendWithTimeout(
      this.accountsClient,
      'permissions.revokeUserPermission',
      dto,
    );
  }

  // Check if user has specific permission
  @RequirePermission('permissions', 'read')
  @Post('check')
  async checkPermission(
    @Body()
    payload: {
      userId: string;
      resource: string;
      action: string;
      tenantId?: string;
      context?: Record<string, any>;
    },
  ) {
    return this.microserviceService.sendWithTimeout(
      this.accountsClient,
      'permissions.hasPermission',
      payload,
    );
  }

  // Get permission management statistics
  @RequirePermission('permissions', 'read')
  @Get('stats')
  async getPermissionStats() {
    return this.microserviceService.sendWithTimeout(
      this.accountsClient,
      'permissions.getStats',
      {},
    );
  }

  // Refresh user permission cache
  @RequirePermission('permissions', 'manage')
  @Post('users/:userId/refresh-cache')
  async refreshUserPermissionCache(
    @Param('userId') userId: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.accountsClient,
      'permissions.refreshUserSnapshot',
      { userId, tenantId },
    );
  }

  // Invalidate user permission cache
  @RequirePermission('permissions', 'manage')
  @Delete('users/:userId/cache')
  async invalidateUserPermissionCache(
    @Param('userId') userId: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.accountsClient,
      'permissions.invalidateUserCache',
      { userId, tenantId },
    );
  }
}
