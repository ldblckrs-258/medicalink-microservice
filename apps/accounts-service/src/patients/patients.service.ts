import { Injectable } from '@nestjs/common';
import { CreatePatientDto, UpdatePatientDto } from '@app/contracts';
import { PatientRepository } from './patient.repository';

@Injectable()
export class PatientsService {
  constructor(private readonly patientRepository: PatientRepository) {}

  async create(createPatientDto: CreatePatientDto) {
    return await this.patientRepository.create(createPatientDto);
  }

  async findAll() {
    return await this.patientRepository.findAllActive();
  }

  async findOne(id: string) {
    return await this.patientRepository.findById(id);
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    return await this.patientRepository.update(id, updatePatientDto);
  }

  async remove(id: string) {
    return await this.patientRepository.softDelete(id);
  }

  // Additional methods using repository
  async findByEmail(email: string) {
    return await this.patientRepository.findByEmail(email);
  }

  async searchPatients(query: string) {
    return await this.patientRepository.searchPatients(query);
  }

  async findActivePatients() {
    return await this.patientRepository.findActivePatients();
  }

  async findPatientsByDateRange(startDate: Date, endDate: Date) {
    return await this.patientRepository.findPatientsByDateRange(
      startDate,
      endDate,
    );
  }

  async updatePatientStatus(id: string, deleted: boolean) {
    return await this.patientRepository.updatePatientStatus(id, deleted);
  }

  async findPatientsWithPagination(
    page: number = 1,
    limit: number = 10,
    filters?: any,
  ) {
    const skip = (page - 1) * limit;
    return await this.patientRepository.findMany({
      where: { ...filters, deletedAt: null },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}
