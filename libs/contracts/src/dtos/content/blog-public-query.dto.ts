import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../common/pagination.dto';

export class BlogPublicQueryDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'categoryId must be a string' })
  categoryId?: string;

  @IsOptional()
  @IsString({ message: 'specialyId must be a string' })
  specialyId?: string;
}
