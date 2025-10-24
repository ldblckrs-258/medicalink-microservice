import { IsString, IsOptional, IsIn } from 'class-validator';
import { IsCuid } from '@app/contracts/decorators';

export class UpdateQuestionDto {
  @IsCuid({ message: 'Question ID must be a valid CUID' })
  id: string;

  @IsCuid({ message: 'specialtyId must be a valid CUID' })
  @IsOptional()
  specialtyId?: string;

  @IsString({ message: 'status must be a string' })
  @IsOptional()
  @IsIn(['PENDING', 'ANSWERED', 'CLOSED'], {
    message: 'status must be PENDING, ANSWERED, or CLOSED',
  })
  status?: 'PENDING' | 'ANSWERED' | 'CLOSED';
}
