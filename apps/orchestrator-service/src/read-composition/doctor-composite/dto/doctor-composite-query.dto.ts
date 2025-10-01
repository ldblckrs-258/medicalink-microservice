import { IsOptional, IsString, IsBoolean, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PaginationParams } from '../../../common/types';

/**
 * Query DTO for fetching doctor composite data
 */
export class DoctorCompositeQueryDto implements PaginationParams {
  // Pagination
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toString().toLowerCase())
  sortOrder?: 'asc' | 'desc';

  // Filters
  @IsOptional()
  @IsString()
  search?: string; // Search by fullName, email

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialtyIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workLocationIds?: string[];

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  // Cache control
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  skipCache?: boolean; // Force fresh data fetch
}
