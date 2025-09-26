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
