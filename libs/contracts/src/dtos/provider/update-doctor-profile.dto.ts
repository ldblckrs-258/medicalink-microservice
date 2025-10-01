import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  MaxLength,
} from 'class-validator';

export class UpdateDoctorProfileDto {
  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  staffAccountId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  degree?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  position?: string[];

  @IsString()
  @IsOptional()
  introduction?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  memberships?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  awards?: string[];

  @IsString()
  @IsOptional()
  research?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  trainingProcess?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  experience?: string[];

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  portrait?: string;
}
