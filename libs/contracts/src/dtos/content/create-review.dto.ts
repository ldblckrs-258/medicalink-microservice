import {
  IsNumber,
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsEmail,
  Min,
  Max,
} from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsString()
  @IsOptional()
  authorName?: string;

  @IsEmail()
  @IsOptional()
  authorEmail?: string;

  @IsUUID()
  doctorId: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
