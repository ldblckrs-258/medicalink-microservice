import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PermissionConditionDto {
  @IsString()
  field: string;

  @IsEnum(['equals', 'not_equals', 'in', 'not_in', 'contains'])
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains';

  @IsString()
  value: any;
}

export class AssignUserPermissionDto {
  @IsString()
  userId: string;

  @IsString()
  permissionId: string;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsEnum(['ALLOW', 'DENY'])
  effect?: 'ALLOW' | 'DENY';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionConditionDto)
  conditions?: PermissionConditionDto[];
}

export class RevokeUserPermissionDto {
  @IsString()
  userId: string;

  @IsString()
  permissionId: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class CreatePermissionGroupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class UpdatePermissionGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class AddUserToGroupDto {
  @IsString()
  userId: string;

  @IsString()
  groupId: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class RemoveUserFromGroupDto {
  @IsString()
  userId: string;

  @IsString()
  groupId: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class AssignGroupPermissionDto {
  @IsString()
  groupId: string;

  @IsString()
  permissionId: string;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsEnum(['ALLOW', 'DENY'])
  effect?: 'ALLOW' | 'DENY';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionConditionDto)
  conditions?: PermissionConditionDto[];
}

export class RevokeGroupPermissionDto {
  @IsString()
  groupId: string;

  @IsString()
  permissionId: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class CreatePermissionDto {
  @IsString()
  resource: string;

  @IsString()
  action: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  resource?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

// Response DTOs
export interface PermissionGroupResponseDto {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  userCount?: number;
  permissionCount?: number;
}

export interface UserPermissionResponseDto {
  id: string;
  userId: string;
  permissionId: string;
  tenantId: string;
  effect: 'ALLOW' | 'DENY';
  conditions?: PermissionConditionDto[];
  permission: {
    resource: string;
    action: string;
    description?: string;
  };
  createdAt: Date;
}

export interface GroupPermissionResponseDto {
  id: string;
  groupId: string;
  permissionId: string;
  tenantId: string;
  effect: 'ALLOW' | 'DENY';
  conditions?: PermissionConditionDto[];
  permission: {
    resource: string;
    action: string;
    description?: string;
  };
  createdAt: Date;
}

export interface UserGroupMembershipResponseDto {
  id: string;
  userId: string;
  groupId: string;
  tenantId: string;
  group: {
    name: string;
    description?: string;
  };
  createdAt: Date;
}

export interface PermissionManagementStatsDto {
  totalPermissions: number;
  totalGroups: number;
  totalUserPermissions: number;
  totalGroupPermissions: number;
  totalUserGroupMemberships: number;
  mostUsedPermissions: Array<{
    resource: string;
    action: string;
    usage: number;
  }>;
  largestGroups: Array<{
    id: string;
    name: string;
    memberCount: number;
  }>;
}
