export interface QuestionResponseDto {
  id: string;
  title: string;
  content: string;
  authorId: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    description?: string;
  };
  tags?: string[];
  isAnswered: boolean;
  status: string;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}
