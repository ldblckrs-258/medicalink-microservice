export interface QuestionResponseDto {
  id: string;
  title: string;
  body: string;
  authorName?: string;
  authorEmail?: string;
  specialtyId?: string;
  publicIds?: string[];
  isAnswered: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
