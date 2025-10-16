import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsArray,
  IsEmail,
} from 'class-validator';
import { IsCuid } from '@app/contracts/decorators';

export class CreateQuestionDto {
  @IsString({ message: 'title must be a string' })
  @IsNotEmpty({ message: 'title is required' })
  @MaxLength(200, { message: 'title must be at most 200 characters' })
  title: string;

  @IsString({ message: 'body must be a string' })
  @IsNotEmpty({ message: 'body is required' })
  body: string;

  @IsString({ message: 'authorName must be a string' })
  @IsOptional()
  @MaxLength(120, { message: 'authorName must be at most 120 characters' })
  authorName?: string;

  @IsEmail({}, { message: 'authorEmail must be a valid email address' })
  @IsOptional()
  authorEmail?: string;

  @IsCuid({ message: 'specialtyId must be a valid CUID' })
  @IsOptional()
  specialtyId?: string;

  @IsArray({ message: 'publicIds must be an array of strings' })
  @IsString({ each: true, message: 'each publicId must be a string' })
  @IsOptional()
  publicIds?: string[];
}
