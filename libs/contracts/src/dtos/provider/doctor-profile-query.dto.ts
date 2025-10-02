import { Type, Transform } from 'class-transformer';
import { IsOptional, IsString, IsArray, IsBoolean } from 'class-validator';
import { PaginationDto } from '../common';

export class DoctorProfileQueryDto extends PaginationDto {
  @IsOptional()
  @IsArray({ message: 'Specialty IDs must be an array' })
  @IsString({ each: true, message: 'Each specialty ID must be a string' })
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    // Convert comma-separated string to array
    return typeof value === 'string'
      ? value
          .split(',')
          .map((id) => id.trim())
          .filter((id) => id.length > 0)
      : value;
  })
  specialtyIds?: string[];

  @IsOptional()
  @IsArray({ message: 'Work location IDs must be an array' })
  @IsString({ each: true, message: 'Each work location ID must be a string' })
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    // Convert comma-separated string to array
    return typeof value === 'string'
      ? value
          .split(',')
          .map((id) => id.trim())
          .filter((id) => id.length > 0)
      : value;
  })
  workLocationIds?: string[];

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  @Type(() => Boolean)
  isActive?: boolean;
}

export class GetDoctorsByAccountIdsDto {
  @IsArray({ message: 'Staff account IDs must be an array' })
  @IsString({ each: true, message: 'Each staff account ID must be a string' })
  staffAccountIds: string[];

  @IsOptional()
  @IsArray({ message: 'Specialty IDs must be an array' })
  @IsString({ each: true, message: 'Each specialty ID must be a string' })
  specialtyIds?: string[];

  @IsOptional()
  @IsArray({ message: 'Work location IDs must be an array' })
  @IsString({ each: true, message: 'Each location ID must be a string' })
  workLocationIds?: string[];
}

export class ToggleDoctorActiveDto {
  @IsString({ message: 'Doctor ID must be a string' })
  id: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}

export class ToggleDoctorActiveBodyDto {
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}
