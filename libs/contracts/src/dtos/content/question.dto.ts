export interface QuestionDto {
  id: string;
  title: string;
  body: string;
  authorName?: string;
  authorEmail?: string;
  specialtyId?: string;
  isAnswered: boolean;
  status: string;
  publicIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}
