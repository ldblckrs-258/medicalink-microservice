import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../common/pagination.dto';

export class BlogQueryDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'categoryId must be a string' })
  categoryId?: string;

  @IsOptional()
  @IsString({ message: 'specialyId must be a string' })
  specialyId?: string;

  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'], {
    message: 'status must be one of DRAFT, PUBLISHED, ARCHIVED',
  })
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}
