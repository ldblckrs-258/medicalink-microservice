import { Type } from 'class-transformer';
import { IsOptional, IsString, IsArray, IsBoolean } from 'class-validator';
import { PaginationDto } from '../common';

export class DoctorProfileQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  specialtyId?: string;

  @IsOptional()
  @IsString()
  workLocationId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}

export class GetDoctorsByAccountIdsDto {
  @IsArray()
  @IsString({ each: true })
  staffAccountIds: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialtyIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workLocationIds?: string[];
}

export class ToggleDoctorActiveDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ToggleDoctorActiveBodyDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
