import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  Length,
  IsEnum,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import type { StaffRole } from '../auth';

export class CreateAccountDto {
  @IsString({ message: 'Full name must be a string' })
  @Length(2, 100, { message: 'Full name must be between 2 and 100 characters' })
  fullName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value.toLowerCase())
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
