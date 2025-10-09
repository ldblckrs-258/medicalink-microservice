import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  questionId: string;

  @IsUUID()
  authorId: string;
}
