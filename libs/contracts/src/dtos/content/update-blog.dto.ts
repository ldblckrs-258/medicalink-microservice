import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogDto } from './create-blog.dto';
import { IsUUID } from 'class-validator';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {
  @IsUUID()
  id: string;
}
