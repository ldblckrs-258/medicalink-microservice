import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogCategoryDto } from './create-blog-category.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateBlogCategoryDto extends PartialType(CreateBlogCategoryDto) {
  @IsUUID()
  @IsOptional()
  id: string;
}
