import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

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
