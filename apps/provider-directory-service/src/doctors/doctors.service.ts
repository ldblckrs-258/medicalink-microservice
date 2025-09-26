import { Injectable } from '@nestjs/common';
import { DoctorRepository } from './doctor.repository';
import { GetPublicListDto } from 'libs/contracts/src/dtos/provider';
import { PaginatedResponse } from '@app/contracts';

@Injectable()
export class DoctorsService {
  constructor(private readonly doctorRepo: DoctorRepository) {}

  async create(createDoctorDto: any) {
    return this.doctorRepo.create(createDoctorDto);
  }

  async getPublicList(
    filters?: GetPublicListDto,
  ): Promise<PaginatedResponse<any>> {
    const where: any = {};

    if (filters?.specialtyId) {
      where.doctorSpecialties = {
        some: {
          specialty: {
            id: filters.specialtyId,
          },
        },
      };
    }

    if (filters?.workLocationId) {
      where.doctorWorkLocations = {
        some: {
          location: {
            id: filters.workLocationId,
          },
        },
      };
    }

    const include = {
      doctorSpecialties: { include: { specialty: true } },
      doctorWorkLocations: { include: { location: true } },
    };

    const { data, total } = await this.doctorRepo.findManyPublic(
      where,
      include,
      filters,
    );

    const { page = 1, limit = 10 } = filters ?? {};

    return {
      data,
      meta: {
        page,
        limit,
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.doctorRepo.findOne(id, {
      doctorSpecialties: { include: { specialty: true } },
      doctorWorkLocations: { include: { location: true } },
      schedules: { where: { serviceDate: { gte: new Date() } } },
    });
  }

  async update(id: string, updateDoctorDto: any) {
    return this.doctorRepo.update(id, updateDoctorDto);
  }

  async remove(id: string) {
    return this.doctorRepo.remove(id);
  }

  async toggleActive(id: string, active?: boolean) {
    return this.doctorRepo.toggleActive(id, active);
  }
}
