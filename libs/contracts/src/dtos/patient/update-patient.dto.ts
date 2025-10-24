import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  Length,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsCuid } from '@app/contracts/decorators';

export class UpdatePatientDto {
  @IsCuid({ message: 'ID must be a valid CUID' })
  id: string;

  @IsOptional()
  @IsString({ message: 'Full name must be a string' })
  @Length(2, 100, { message: 'Full name must be between 2 and 100 characters' })
  fullName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string | null;

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

  @IsOptional()
  @IsString({ message: 'National ID must be a string' })
  @Length(9, 20, { message: 'National ID must be between 9 and 20 characters' })
  nationalId?: string | null;

  @IsOptional()
  @IsString({ message: 'Insurance number must be a string' })
  insuranceNo?: string | null;

  @IsOptional()
  @IsString({ message: 'Address line 1 must be a string' })
  @Length(1, 200, {
    message: 'Address line 1 must be between 1 and 200 characters',
  })
  addressLine1?: string | null;

  @IsOptional()
  @IsString({ message: 'Address line 2 must be a string' })
  @Length(1, 200, {
    message: 'Address line 2 must be between 1 and 200 characters',
  })
  addressLine2?: string | null;

  @IsOptional()
  @IsString({ message: 'City must be a string' })
  @Length(1, 100, { message: 'City must be between 1 and 100 characters' })
  city?: string | null;

  @IsOptional()
  @IsString({ message: 'Province must be a string' })
  @Length(1, 100, { message: 'Province must be between 1 and 100 characters' })
  province?: string | null;

  @IsOptional()
  @IsString({ message: 'Postal code must be a string' })
  @Matches(/^[A-Za-z0-9\s-]*$/, {
    message: 'Please provide a valid postal code',
  })
  postalCode?: string | null;
}
