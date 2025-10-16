import {
  IsNumber,
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsEmail,
  Min,
  Max,
  IsArray,
} from 'class-validator';

export class CreateReviewDto {
  @IsNumber({}, { message: 'Rating must be a number' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  rating: number;

  @IsString({ message: 'Title must be a string' })
  @IsOptional()
  title?: string;

  @IsString({ message: 'Body must be a string' })
  @IsOptional()
  body?: string;

  @IsArray({ message: 'publicIds must be an array of strings' })
  @IsString({ each: true, message: 'Each publicId must be a string' })
  @IsOptional()
  publicIds?: string[];

  @IsString({ message: 'Author name must be a string' })
  @IsOptional()
  authorName?: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  authorEmail?: string;

  @IsUUID('4', { message: 'Doctor ID must be a valid UUID' })
  doctorId: string;

  @IsBoolean({ message: 'isPublic must be a boolean value' })
  @IsOptional()
  isPublic?: boolean;
}
