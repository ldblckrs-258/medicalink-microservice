export interface WorkLocationResponseDto {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  timezone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
