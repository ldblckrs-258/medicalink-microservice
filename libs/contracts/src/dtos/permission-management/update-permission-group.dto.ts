import { IsString, IsOptional } from 'class-validator';

export class UpdatePermissionGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
