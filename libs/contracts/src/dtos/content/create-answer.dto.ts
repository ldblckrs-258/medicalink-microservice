import { IsString, IsNotEmpty } from 'class-validator';
import { IsCuid } from '@app/contracts/decorators';

export class CreateAnswerDto {
  @IsString({ message: 'Answer body must be a string' })
  @IsNotEmpty({ message: 'Answer body cannot be empty' })
  body: string;

  @IsCuid({ message: 'Question ID must be a valid CUID' })
  questionId: string;

  @IsCuid({ message: 'Author ID must be a valid CUID' })
  authorId: string;
}
