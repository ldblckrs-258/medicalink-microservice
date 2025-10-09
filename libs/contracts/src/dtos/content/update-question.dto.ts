import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionDto } from './create-question.dto';
import { IsUUID } from 'class-validator';

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {
  @IsUUID()
  id: string;
}
