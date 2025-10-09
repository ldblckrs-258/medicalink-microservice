import { PartialType } from '@nestjs/mapped-types';
import { CreateAnswerDto } from './create-answer.dto';
import { IsUUID } from 'class-validator';

export class UpdateAnswerDto extends PartialType(CreateAnswerDto) {
  @IsUUID()
  id: string;
}
