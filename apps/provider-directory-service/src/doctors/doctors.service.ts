import { Injectable } from '@nestjs/common';
import { DoctorRepository } from './doctor.repository';
import { GetPublicListDto } from 'libs/contracts/src/dtos/provider.dto';

@Injectable()
export class DoctorsService {
  constructor(private readonly doctorRepo: DoctorRepository) {}

  async create(createDoctorDto: any) {
    return this.doctorRepo.create(createDoctorDto);
  }

  async getPublicList(filters?: GetPublicListDto) {
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

    return this.doctorRepo.findAll(where, {
      doctorSpecialties: { include: { specialty: true } },
      doctorWorkLocations: { include: { location: true } },
    });
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
