import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class StaffQueryDto {
  @IsOptional()
  @IsNumber({}, { message: 'Skip must be a number' })
  @Min(0, { message: 'Skip must be greater than or equal to 0' })
  @Transform(({ value }) => parseInt(String(value), 10))
  skip?: number = 0;

  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be greater than 0' })
  @Max(100, { message: 'Limit must not exceed 100' })
  @Transform(({ value }) => parseInt(String(value), 10))
  limit?: number = 10;

  @IsOptional()
  @IsEnum(['SUPER_ADMIN', 'ADMIN', 'DOCTOR'], {
    message: 'Role must be one of: SUPER_ADMIN, ADMIN, DOCTOR',
  })
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR';

  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  search?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Please provide a valid date format (YYYY-MM-DD)' },
  )
  createdFrom?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Please provide a valid date format (YYYY-MM-DD)' },
  )
  createdTo?: string;

  @IsOptional()
  @IsEnum(['createdAt', 'fullName', 'email'], {
    message: 'Sort by must be one of: createdAt, fullName, email',
  })
  sortBy?: 'createdAt' | 'fullName' | 'email' = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'], {
    message: 'Sort order must be asc or desc',
  })
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export interface StaffPaginatedResponseDto {
  data: any[];
  meta: {
    skip: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
