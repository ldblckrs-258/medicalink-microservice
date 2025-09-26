export interface PatientFilterOptions {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  nationalId?: string;
  isMale?: boolean;
  deletedAt?: Date | null;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
}
