import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  summary?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsUUID()
  categoryId: string;

  @IsUUID()
  @IsNotEmpty()
  authorId: string;
}
