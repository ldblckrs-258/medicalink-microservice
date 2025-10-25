import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../common/pagination.dto';

export class GetQuestionsQueryDto extends PaginationDto {
  @IsOptional()
  @IsEmail({}, { message: 'email must be a valid email' })
  authorEmail?: string;

  @IsOptional()
  @IsString({ message: 'specialtyId must be a string' })
  specialtyId?: string;

  @IsOptional()
  @IsIn(['PENDING', 'ANSWERED', 'CLOSED'])
  status?: 'PENDING' | 'ANSWERED' | 'CLOSED';
}
