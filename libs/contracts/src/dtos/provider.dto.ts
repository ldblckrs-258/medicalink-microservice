import { SpecialtyDto, WorkLocationDto } from './common.dto';

// Doctor and Provider Directory DTOs
export interface DoctorDto {
  id: string;
  staffAccountId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  licenseNo?: string;
  yearsExperience?: number;
  ratingAvg: number;
  reviewCount: number;
  specialties?: SpecialtyDto[];
  workLocations?: WorkLocationDto[];
}

export interface ScheduleDto {
  id: string;
  doctorId: string;
  locationId: string;
  serviceDate: Date;
  timeStart: string;
  timeEnd: string;
  capacity: number;
}
