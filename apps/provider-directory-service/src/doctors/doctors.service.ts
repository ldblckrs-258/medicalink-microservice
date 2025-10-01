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

  /**
   * Create an empty doctor profile linked to a staff account
   * Used by orchestrator service during doctor account creation
   */
  async createEmpty(staffAccountId: string) {
    return this.doctorRepo.create({
      staffAccountId,
      isActive: false, // Inactive until profile is completed
    });
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

  /**
   * Get doctor profiles by staff account IDs
   * Used by orchestrator service for read composition
   */
  async getByAccountIds(payload: {
    staffAccountIds: string[];
    specialtyIds?: string[];
    workLocationIds?: string[];
  }) {
    const where: any = {
      staffAccountId: { in: payload.staffAccountIds },
      isActive: true, // Only return active doctors
    };

    // Filter by specialties if provided
    if (payload.specialtyIds && payload.specialtyIds.length > 0) {
      where.doctorSpecialties = {
        some: {
          specialtyId: { in: payload.specialtyIds },
        },
      };
    }

    // Filter by work locations if provided
    if (payload.workLocationIds && payload.workLocationIds.length > 0) {
      where.doctorWorkLocations = {
        some: {
          locationId: { in: payload.workLocationIds },
        },
      };
    }

    const include = {
      doctorSpecialties: { include: { specialty: true } },
      doctorWorkLocations: { include: { location: true } },
    };

    return this.doctorRepo.findAll(where, include);
  }
}
