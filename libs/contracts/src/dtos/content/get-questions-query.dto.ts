import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../common/pagination.dto';

export class GetQuestionsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'categoryId must be a string' })
  categoryId?: string;
}
