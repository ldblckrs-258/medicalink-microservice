import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsArray,
} from 'class-validator';
import { IsCuid } from '@app/contracts/decorators';

export class CreateBlogDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(200, { message: 'Title must be at most 200 characters' })
  title: string;

  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @IsString({ message: 'Summary must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'Summary must be at most 500 characters' })
  summary?: string;

  @IsString({ message: 'Image URL must be a string' })
  @IsOptional()
  imageUrl?: string;

  @IsArray({ message: 'publicIds must be an array of strings' })
  @IsString({ each: true, message: 'Each publicId must be a string' })
  @IsOptional()
  publicIds?: string[];

  @IsArray({ message: 'specialtyIds must be an array of strings' })
  @IsString({ each: true, message: 'Each specialtyId must be a string' })
  @IsOptional()
  specialtyIds?: string[];

  @IsCuid({ message: 'Category ID must be a valid CUID' })
  categoryId: string;

  @IsCuid({ message: 'Author ID must be a valid CUID' })
  @IsNotEmpty({ message: 'Author ID is required' })
  authorId: string;
}
