import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogCategoryDto } from './create-blog-category.dto';
import { IsUUID } from 'class-validator';

export class UpdateBlogCategoryDto extends PartialType(CreateBlogCategoryDto) {
  @IsUUID()
  id: string;
}
