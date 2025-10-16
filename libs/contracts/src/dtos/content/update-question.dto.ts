import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionDto } from './create-question.dto';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { IsCuid } from '@app/contracts/decorators';

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {
  @IsCuid({ message: 'Question ID must be a valid CUID' })
  id: string;

  @IsString({ message: 'status must be a string' })
  @IsOptional()
  @IsIn(['PENDING', 'ANSWERED', 'CLOSED'], {
    message: 'status must be PENDING, ANSWERED, or CLOSED',
  })
  status?: 'PENDING' | 'ANSWERED' | 'CLOSED';
}
