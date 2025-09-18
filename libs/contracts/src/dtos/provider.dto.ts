import {
  SpecialtyDto,
  WorkLocationDto,
  PaginationDto,
  PaginatedResponse,
} from './common.dto';
import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';

// Specialty DTOs
export class CreateSpecialtyDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(120, { message: 'Name must not exceed 120 characters' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}

export class UpdateSpecialtyDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(120, { message: 'Name must not exceed 120 characters' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}

export class SpecialtyQueryDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'Sort field must be a string' })
  @IsIn(['name', 'createdAt', 'updatedAt'], {
    message: 'Sort field must be one of: name, createdAt, updatedAt',
  })
  sortBy?: 'name' | 'createdAt' | 'updatedAt' = 'name';

  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  @IsIn(['ASC', 'DESC'], {
    message: 'Sort order must be either ASC or DESC',
  })
  sortOrder?: 'ASC' | 'DESC' = 'ASC';

  @IsOptional()
  @IsBoolean({ message: 'Active filter must be a boolean' })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Include metadata must be a boolean' })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  includeMetadata?: boolean;
}

export interface SpecialtyResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  infoSectionsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpecialtyWithInfoSectionsResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  infoSections: SpecialtyInfoSectionResponseDto[];
}

export interface SpecialtyPublicResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export type SpecialtyPaginatedResponseDto =
  PaginatedResponse<SpecialtyResponseDto>;

export type SpecialtyPublicPaginatedResponseDto =
  PaginatedResponse<SpecialtyPublicResponseDto>;

// Specialty Info Section DTOs
export class CreateSpecialtyInfoSectionDto {
  @IsString({ message: 'Specialty ID must be a string' })
  @IsNotEmpty({ message: 'Specialty ID is required' })
  specialtyId: string;

  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(120, { message: 'Name must not exceed 120 characters' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Content must be a string' })
  content?: string;
}

export class UpdateSpecialtyInfoSectionDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(120, { message: 'Name must not exceed 120 characters' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Content must be a string' })
  content?: string;
}

export interface SpecialtyInfoSectionResponseDto {
  id: string;
  specialtyId: string;
  name: string;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SpecialtyInfoSectionPaginatedResponseDto =
  PaginatedResponse<SpecialtyInfoSectionResponseDto>;

// Work Location DTOs
export class CreateWorkLocationDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(160, { message: 'Name must not exceed 160 characters' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  @MaxLength(255, { message: 'Address must not exceed 255 characters' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MaxLength(32, { message: 'Phone must not exceed 32 characters' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Timezone must be a string' })
  @MaxLength(64, { message: 'Timezone must not exceed 64 characters' })
  timezone?: string = 'Asia/Ho_Chi_Minh';
}

export class UpdateWorkLocationDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(160, { message: 'Name must not exceed 160 characters' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  @MaxLength(255, { message: 'Address must not exceed 255 characters' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MaxLength(32, { message: 'Phone must not exceed 32 characters' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Timezone must be a string' })
  @MaxLength(64, { message: 'Timezone must not exceed 64 characters' })
  timezone?: string;

  @IsOptional()
  @IsBoolean({ message: 'IsActive must be a boolean' })
  isActive?: boolean;
}

export class WorkLocationPublicQueryDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'Sort field must be a string' })
  sortBy?: string = 'name';

  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  @IsIn(['ASC', 'DESC'], {
    message: 'Sort order must be either ASC or DESC',
  })
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

export class WorkLocationQueryDto extends WorkLocationPublicQueryDto {
  @IsOptional()
  @IsBoolean({ message: 'IsActive must be a boolean' })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Include metadata must be a boolean' })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  includeMetadata?: boolean;
}

export interface WorkLocationResponseDto {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  timezone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkLocationPaginatedResponseDto =
  PaginatedResponse<WorkLocationResponseDto>;

// Doctor and Provider Directory DTOs
export interface DoctorDto {
  id: string;
  staffAccountId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  licenseNo?: string;
  yearsExperience?: number;
  ratingAvg: number;
  reviewCount: number;
  specialties?: SpecialtyDto[];
  workLocations?: WorkLocationDto[];
}

export interface ScheduleDto {
  id: string;
  doctorId: string;
  locationId: string;
  serviceDate: Date;
  timeStart: string;
  timeEnd: string;
  capacity: number;
}

// Public DTOs (aliases from common.dto.ts)
// These DTOs exclude sensitive fields like isActive, createdAt, updatedAt
export type { SpecialtyDto as PublicSpecialtyDto } from './common.dto';
export type { WorkLocationDto as PublicWorkLocationDto } from './common.dto';
