import { Injectable } from '@nestjs/common';
import { DoctorRepository } from './doctor.repository';
import {
  CreateDoctorProfileDto,
  UpdateDoctorProfileDto,
  DoctorProfileQueryDto,
  GetDoctorsByAccountIdsDto,
  PaginatedResponse,
  DoctorProfileResponseDto,
} from '@app/contracts';
import { NotFoundError, ErrorCode } from '@app/domain-errors';

@Injectable()
export class DoctorsService {
  constructor(private readonly doctorRepo: DoctorRepository) {}

  async create(
    createDoctorDto: CreateDoctorProfileDto,
  ): Promise<DoctorProfileResponseDto> {
    return this.doctorRepo.create(createDoctorDto);
  }

  /**
   * Create an empty doctor profile linked to a staff account
   * Used by orchestrator service during doctor account creation
   */
  async createEmpty(staffAccountId: string): Promise<DoctorProfileResponseDto> {
    return this.doctorRepo.create({
      staffAccountId,
      isActive: false, // Inactive until profile is completed
    });
  }

  async getPublicList(
    filters?: DoctorProfileQueryDto,
  ): Promise<PaginatedResponse<DoctorProfileResponseDto>> {
    const where: any = {
      isActive: true, // Always filter by active doctors for public list
    };

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

  async findOne(id: string): Promise<DoctorProfileResponseDto> {
    const doctor = await this.doctorRepo.findOne(id, {
      doctorSpecialties: { include: { specialty: true } },
      doctorWorkLocations: { include: { location: true } },
      schedules: { where: { serviceDate: { gte: new Date() } } },
    });

    if (!doctor) {
      throw new NotFoundError(`Doctor profile with id ${id} not found`, {
        code: ErrorCode.DOCTOR_PROFILE_NOT_FOUND,
      });
    }

    return doctor;
  }

  async update(
    id: string,
    updateDoctorDto: Omit<UpdateDoctorProfileDto, 'id'>,
  ): Promise<DoctorProfileResponseDto> {
    // Check if doctor exists first
    const existing = await this.doctorRepo.findOne(id);
    if (!existing) {
      throw new NotFoundError(`Doctor profile with id ${id} not found`, {
        code: ErrorCode.DOCTOR_PROFILE_NOT_FOUND,
      });
    }

    return this.doctorRepo.update(id, updateDoctorDto);
  }

  async remove(id: string): Promise<DoctorProfileResponseDto> {
    // Check if doctor exists first
    const existing = await this.doctorRepo.findOne(id);
    if (!existing) {
      throw new NotFoundError(`Doctor profile with id ${id} not found`, {
        code: ErrorCode.DOCTOR_PROFILE_NOT_FOUND,
      });
    }

    return this.doctorRepo.remove(id);
  }

  async toggleActive(
    id: string,
    active?: boolean,
  ): Promise<DoctorProfileResponseDto> {
    const doctor = await this.doctorRepo.toggleActive(id, active);

    if (!doctor) {
      throw new NotFoundError(`Doctor profile with id ${id} not found`, {
        code: ErrorCode.DOCTOR_PROFILE_NOT_FOUND,
      });
    }

    return doctor;
  }

  /**
   * Get doctor profiles by staff account IDs
   * Used by orchestrator service for read composition
   */
  async getByAccountIds(
    payload: GetDoctorsByAccountIdsDto,
  ): Promise<DoctorProfileResponseDto[]> {
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

  /**
   * Get doctor profile by staff account ID
   * Used by orchestrator service for read composition
   */
  async getByAccountId(
    staffAccountId: string,
  ): Promise<DoctorProfileResponseDto> {
    const doctor = await this.doctorRepo.findOneByStaffAccountId(
      {
        staffAccountId,
      },
      {
        doctorSpecialties: { include: { specialty: true } },
        doctorWorkLocations: { include: { location: true } },
      },
    );

    if (!doctor) {
      throw new NotFoundError(
        `Doctor profile with staff account ID ${staffAccountId} not found`,
        {
          code: ErrorCode.DOCTOR_PROFILE_NOT_FOUND,
        },
      );
    }

    return doctor;
  }
}
