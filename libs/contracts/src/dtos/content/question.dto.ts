export interface QuestionDto {
  id: string;
  title: string;
  content: string;
  authorId: string;
  categoryId?: string;
  tags?: string[];
  isAnswered: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}
