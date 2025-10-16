export interface BlogResponseDto {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  publicIds?: string[];
  authorId: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    description?: string;
  };
  specialtyIds?: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
