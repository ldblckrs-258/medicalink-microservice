import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  Length,
  IsEnum,
  IsUUID,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export type StaffRole = 'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR';

// Auth DTOs
export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsString({ message: 'Email must be a string' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @Length(6, 50, { message: 'Password must be between 6 and 50 characters' })
  password: string;
}

export interface LoginResponseDto {
  access_token: string;
  refresh_token: string;
  user: StaffAccountDto;
}

export class RefreshTokenDto {
  @IsString({ message: 'Refresh token must be a string' })
  refresh_token: string;
}

export interface RefreshTokenResponseDto {
  access_token: string;
  refresh_token: string;
}

export class ChangePasswordDto {
  @IsString({ message: 'Current password must be a string' })
  @Length(6, 50, {
    message: 'Current password must be between 6 and 50 characters',
  })
  currentPassword: string;

  @IsString({ message: 'New password must be a string' })
  @Length(8, 50, {
    message: 'New password must be between 8 and 50 characters',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'New password must contain at least one lowercase letter, one uppercase letter, and one number',
  })
  newPassword: string;
}

export interface ChangePasswordResponseDto {
  success: boolean;
  message: string;
}

export class CreateStaffDto {
  @IsString({ message: 'Full name must be a string' })
  @Length(2, 100, { message: 'Full name must be between 2 and 100 characters' })
  fullName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @Length(8, 50, { message: 'Password must be between 8 and 50 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one lowercase letter, one uppercase letter, and one number',
  })
  password: string;

  @IsOptional()
  @IsEnum(['SUPER_ADMIN', 'ADMIN', 'DOCTOR'], {
    message: 'Role must be one of: SUPER_ADMIN, ADMIN, DOCTOR',
  })
  role?: StaffRole;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^[0-9+\-\s()]*$/, {
    message: 'Please provide a valid phone number',
  })
  phone?: string | null;

  @IsOptional()
  @IsBoolean({ message: 'isMale must be a boolean value' })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isMale?: boolean | null;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Please provide a valid date format (YYYY-MM-DD)' },
  )
  dateOfBirth?: Date | null;
}

export class UpdateStaffDto {
  @IsOptional()
  @IsUUID('4', { message: 'ID must be a valid UUID' })
  id?: string;

  @IsOptional()
  @IsString({ message: 'Full name must be a string' })
  @Length(2, 100, { message: 'Full name must be between 2 and 100 characters' })
  fullName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @Length(8, 50, { message: 'Password must be between 8 and 50 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one lowercase letter, one uppercase letter, and one number',
  })
  password?: string;

  @IsOptional()
  @IsEnum(['SUPER_ADMIN', 'ADMIN', 'DOCTOR'], {
    message: 'Role must be one of: SUPER_ADMIN, ADMIN, DOCTOR',
  })
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR';

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^[0-9+\-\s()]*$/, {
    message: 'Please provide a valid phone number',
  })
  phone?: string | null;

  @IsOptional()
  @IsBoolean({ message: 'isMale must be a boolean value' })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isMale?: boolean | null;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Please provide a valid date format (YYYY-MM-DD)' },
  )
  dateOfBirth?: Date | null;
}

export interface StaffAccountDto {
  id: string;
  fullName: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR';
  phone?: string | null;
  isMale?: boolean | null;
  dateOfBirth?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ValidateStaffDto {
  email: string;
  password: string;
}

export interface JwtPayloadDto {
  email: string;
  sub: string;
  role: StaffRole;
  iat?: number;
  exp?: number;
}

// Additional interfaces for repository
export interface CreateStaffAccountDto {
  fullName: string;
  email: string;
  passwordHash: string;
  role?: StaffRole;
  phone?: string | null;
  isMale?: boolean | null;
  dateOfBirth?: Date | null;
}

export interface UpdateStaffAccountDto extends Partial<CreateStaffAccountDto> {
  deletedAt?: Date | null;
}

export interface StaffAccountFilterOptions {
  id?: string;
  email?: string;
  fullName?: string;
  role?: StaffRole;
  deletedAt?: Date | null;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
}
