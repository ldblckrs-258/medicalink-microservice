export interface AnswerDto {
  id: string;
  questionId: string;
  content: string;
  authorId: string;
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
