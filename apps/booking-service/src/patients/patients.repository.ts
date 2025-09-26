import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@app/repositories';
import {
  CreatePatientDto,
  UpdatePatientDto,
  PatientFilterOptions,
} from '@app/contracts';
import { PrismaService } from '../../prisma/prisma.service';

export type Patient = any;

@Injectable()
export class PatientRepository extends BaseRepository<
  Patient,
  CreatePatientDto,
  UpdatePatientDto,
  PatientFilterOptions
> {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService.patient);
  }

  // Custom methods specific to Patient entity
  async findByEmail(email: string): Promise<Patient> {
    return await this.model.findUnique({
      where: { email },
    });
  }

  async findActivePatients(): Promise<Patient[]> {
    return await this.model.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchPatients(query: string): Promise<Patient[]> {
    return await this.model.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPatientsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Patient[]> {
    return await this.model.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePatientStatus(id: string, deleted: boolean): Promise<Patient> {
    return await this.model.update({
      where: { id },
      data: { deletedAt: deleted ? new Date() : null },
    });
  }

  async create(data: CreatePatientDto): Promise<Patient> {
    const { createId } = await import('@paralleldrive/cuid2');
    return await this.model.create({
      data: {
        id: createId(),
        ...data,
      },
    });
  }

  async findAll(): Promise<Patient[]> {
    return await this.model.findMany({
      where: { deletedAt: null },
    });
  }

  async softDelete(id: string): Promise<Patient> {
    return await this.model.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findAllActive(): Promise<Patient[]> {
    return await this.model.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }
}
