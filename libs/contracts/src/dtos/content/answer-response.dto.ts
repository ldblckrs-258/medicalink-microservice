export interface AnswerResponseDto {
  id: string;
  content: string;
  questionId: string;
  authorId: string;
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
