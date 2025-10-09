import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateBlogCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
