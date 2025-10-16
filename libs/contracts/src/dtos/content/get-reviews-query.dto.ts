import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../common/pagination.dto';

export class GetReviewsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'doctorId must be a string' })
  doctorId?: string;
}
