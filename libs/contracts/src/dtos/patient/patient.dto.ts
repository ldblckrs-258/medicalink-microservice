export interface PatientDto {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  isMale: boolean | null;
  dateOfBirth: Date | null;
  nationalId: string | null;
  insuranceNo: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
