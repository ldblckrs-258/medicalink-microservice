import { PartialType } from '@nestjs/mapped-types';
import { CreateAnswerDto } from './create-answer.dto';
import { IsCuid } from '@app/contracts/decorators';

export class UpdateAnswerDto extends PartialType(CreateAnswerDto) {
  @IsCuid({ message: 'Answer ID must be a valid CUID' })
  id: string;
}
