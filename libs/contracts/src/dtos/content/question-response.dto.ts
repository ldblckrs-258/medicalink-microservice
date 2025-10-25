export interface QuestionResponseDto {
  id: string;
  title: string;
  body: string;
  authorName?: string;
  authorEmail?: string;
  specialtyId?: string;
  publicIds?: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
