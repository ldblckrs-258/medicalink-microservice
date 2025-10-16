import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationDto } from '../common/pagination.dto';

export class GetAnswersQueryDto extends PaginationDto {
  @IsOptional()
  @IsBoolean({ message: 'acceptedOnly must be a boolean' })
  acceptedOnly?: boolean;
}
