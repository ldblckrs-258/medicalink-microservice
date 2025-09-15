// Content Service DTOs
export interface BlogDto {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  authorId: string;
  categoryId?: string;
  tags?: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface AnswerDto {
  id: string;
  questionId: string;
  content: string;
  authorId: string;
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
