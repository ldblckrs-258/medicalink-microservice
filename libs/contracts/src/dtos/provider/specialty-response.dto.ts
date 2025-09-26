export interface SpecialtyResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  infoSectionsCount: number;
  createdAt: Date;
  updatedAt: Date;
}
