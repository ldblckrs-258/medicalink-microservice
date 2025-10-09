import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import type { JwtPayloadDto } from '@app/contracts';
import {
  AddUserToGroupDto,
  AssignGroupPermissionDto,
  AssignUserPermissionDto,
  CreatePermissionGroupDto,
  CurrentUser,
  RequirePermission,
  RevokeGroupPermissionDto,
  RevokeUserPermissionDto,
  UpdatePermissionGroupDto,
} from '@app/contracts';
import { MicroserviceService } from '../utils/microservice.service';

@Controller('permissions')
export class PermissionsController {
  constructor(
    @Inject('ACCOUNTS_SERVICE') private readonly accountsClient: ClientProxy,
    private readonly microserviceService: MicroserviceService,
  ) {}

  // Get all available permissions
  @RequirePermission('permissions', 'manage')
  @Get()
  async getAllPermissions() {
    return this.microserviceService.sendWithTimeout(
      this.accountsClient,
      'permissions.getAll',
      {},
    );
  }

  // Get permissions for a specific user
  @RequirePermission('permissions', 'manage')
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
      'permissions.getUserPermissions',
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
  @RequirePermission('permissions', 'manage')
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
  @RequirePermission('permissions', 'manage')
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
  async invalidateUserPermissionCache(@Param('userId') userId: string) {
    return this.microserviceService.sendWithTimeout(
      this.accountsClient,
      'permissions.invalidateUserCache',
      { userId },
    );
  }

  // Group Management Endpoints
  @RequirePermission('permissions', 'manage')
  @Get('groups')
  async getAllGroups(@Query('tenantId') tenantId?: string) {
    return this.microserviceService.sendWithTimeout(
      this.accountsClient,
      'permissions.getAllGroups',
      { tenantId },
    );
  }

  @RequirePermission('permissions', 'manage')
  @Post('groups')
  async createGroup(@Body() dto: CreatePermissionGroupDto) {
    return this.microserviceService.sendWithTimeout(
      this.accountsClient,
      'permissions.createGroup',
      dto,
    );
  }

  @RequirePermission('permissions', 'manage')
  @Put('groups/:groupId')
  async updateGroup(
    @Param('groupId') groupId: string,
    @Body() dto: UpdatePermissionGroupDto,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.accountsClient,
      'permissions.updateGroup',
      {
        ...dto,
        id: groupId,
        tenantId: dto.tenantId || 'global',
      },
    );
  }

  @RequirePermission('permissions', 'manage')
  @Delete('groups/:groupId')
  async deleteGroup(@Param('groupId') groupId: string) {
    return this.microserviceService.sendWithTimeout(
      this.accountsClient,
      'permissions.deleteGroup',
      { groupId },
    );
  }

  // User Group Management
  @RequirePermission('permissions', 'manage')
  @Get('users/:userId/groups')
  async getUserGroups(
    @Param('userId') userId: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.accountsClient,
      'permissions.getUserGroups',
      { userId, tenantId },
    );
  }

  @RequirePermission('permissions', 'manage')
  @Post('users/:userId/groups')
  async addUserToGroup(
    @Param('userId') userId: string,
    @Body() dto: Omit<AddUserToGroupDto, 'userId'>,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.accountsClient,
      'permissions.addUserToGroup',
      { ...dto, userId },
    );
  }

  @RequirePermission('permissions', 'manage')
  @Delete('users/:userId/groups/:groupId')
  async removeUserFromGroup(
    @Param('userId') userId: string,
    @Param('groupId') groupId: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.accountsClient,
      'permissions.removeUserFromGroup',
      { userId, groupId, tenantId },
    );
  }

  // Group Permission Management
  @RequirePermission('permissions', 'manage')
  @Get('groups/:groupId/permissions')
  async getGroupPermissions(
    @Param('groupId') groupId: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.accountsClient,
      'permissions.getGroupPermissions',
      { groupId, tenantId },
    );
  }

  @RequirePermission('permissions', 'manage')
  @Post('groups/:groupId/permissions')
  async assignGroupPermission(
    @Param('groupId') groupId: string,
    @Body() dto: Omit<AssignGroupPermissionDto, 'groupId'>,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.accountsClient,
      'permissions.assignGroupPermission',
      { ...dto, groupId },
    );
  }

  @RequirePermission('permissions', 'manage')
  @Delete('groups/:groupId/permissions')
  async revokeGroupPermission(
    @Param('groupId') groupId: string,
    @Body() dto: Omit<RevokeGroupPermissionDto, 'groupId'>,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.accountsClient,
      'permissions.revokeGroupPermission',
      { ...dto, groupId },
    );
  }
}
