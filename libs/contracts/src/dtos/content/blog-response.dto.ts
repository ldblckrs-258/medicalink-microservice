export interface BlogResponseDto {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  authorId: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    description?: string;
  };
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
