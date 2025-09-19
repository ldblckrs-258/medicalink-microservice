import { Injectable, Logger } from '@nestjs/common';
import { ConflictError, NotFoundError, ErrorCode } from '@app/domain-errors';
import { StaffRepository } from '../staffs/staff.repository';
import { PermissionAssignmentService } from '../permission/permission-assignment.service';
import { StaffRole } from '../../prisma/generated/client';
import {
  CreateStaffDto,
  UpdateStaffDto,
  StaffQueryDto,
  StaffAccountDto,
  StaffPaginatedResponseDto,
  StaffStatsDto,
} from '@app/contracts';

@Injectable()
export class DoctorAccountsService {
  private readonly logger = new Logger(DoctorAccountsService.name);

  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly permissionAssignmentService: PermissionAssignmentService,
  ) {}

  async findAll(query: StaffQueryDto): Promise<StaffPaginatedResponseDto> {
    // Force filter to only show doctors
    const doctorQuery = { ...query, role: 'DOCTOR' as StaffRole };
    const { data, total } = await this.staffRepository.findMany(doctorQuery);
    const { skip = 0, limit = 10 } = query;

    return {
      data: data.map((staff) => this.mapToStaffAccountDto(staff)),
      meta: {
        skip,
        limit,
        total,
        hasNext: skip + limit < total,
        hasPrev: skip > 0,
      },
    };
  }

  async findOne(id: string): Promise<StaffAccountDto> {
    const staff = await this.staffRepository.findById(id);

    if (!staff) {
      throw new NotFoundError('Doctor not found', {
        code: ErrorCode.USER_NOT_FOUND,
      });
    }

    if (staff.role !== StaffRole.DOCTOR) {
      throw new NotFoundError('Doctor not found', {
        code: ErrorCode.USER_NOT_FOUND,
      });
    }

    return this.mapToStaffAccountDto(staff);
  }

  async create(createDoctorDto: CreateStaffDto): Promise<StaffAccountDto> {
    this.logger.log(`Creating new doctor account: ${createDoctorDto.email}`);

    const doctorData = { ...createDoctorDto, role: StaffRole.DOCTOR };

    const existingStaff = await this.staffRepository.findByEmail(
      doctorData.email,
    );

    if (existingStaff) {
      throw new ConflictError('Email already exists', {
        code: ErrorCode.USER_EMAIL_TAKEN,
      });
    }

    const doctor = await this.staffRepository.create(doctorData);

    try {
      const permissionResult =
        await this.permissionAssignmentService.assignPermissionsToNewUser(
          doctor.id,
          StaffRole.DOCTOR,
        );

      this.logger.log(
        `Doctor created and permissions assigned: ${doctor.email} - ${permissionResult.assignedPermissions.length} permissions`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to assign permissions to new doctor ${doctor.email}:`,
        error.stack,
      );

      this.logger.warn(
        `Doctor ${doctor.email} created without permissions. Manual assignment required.`,
      );
    }

    return this.mapToStaffAccountDto(doctor);
  }

  async update(
    id: string,
    updateDoctorDto: UpdateStaffDto,
  ): Promise<StaffAccountDto> {
    const existingDoctor = await this.staffRepository.findById(id);

    if (!existingDoctor) {
      throw new NotFoundError('Doctor not found', {
        code: ErrorCode.USER_NOT_FOUND,
      });
    }

    if (existingDoctor.role !== StaffRole.DOCTOR) {
      throw new NotFoundError('Doctor not found', {
        code: ErrorCode.USER_NOT_FOUND,
      });
    }

    const doctorData = { ...updateDoctorDto };
    delete doctorData.role;

    if (doctorData.email && doctorData.email !== existingDoctor.email) {
      const staffWithEmail = await this.staffRepository.findByEmail(
        doctorData.email,
      );

      if (staffWithEmail) {
        throw new ConflictError('Email already exists', {
          code: ErrorCode.USER_EMAIL_TAKEN,
        });
      }
    }

    const doctor = await this.staffRepository.update(id, doctorData);
    return this.mapToStaffAccountDto(doctor);
  }

  async remove(id: string): Promise<StaffAccountDto> {
    const existingDoctor = await this.staffRepository.findById(id);

    if (!existingDoctor) {
      throw new NotFoundError('Doctor not found', {
        code: ErrorCode.USER_NOT_FOUND,
      });
    }

    if (existingDoctor.role !== StaffRole.DOCTOR) {
      throw new NotFoundError('Doctor not found', {
        code: ErrorCode.USER_NOT_FOUND,
      });
    }

    const doctor = await this.staffRepository.softDelete(id);
    return this.mapToStaffAccountDto(doctor);
  }

  async getStats(): Promise<StaffStatsDto> {
    const query = { role: StaffRole.DOCTOR };
    const { total } = await this.staffRepository.findMany(query);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    return {
      total,
      byRole: {
        DOCTOR: total,
        ADMIN: 0,
        SUPER_ADMIN: 0,
      },
      recentlyCreated: 0,
      deleted: 0,
    };
  }

  /**
   * Manual permission assignment for existing doctors
   */
  async assignPermissionsToUser(
    userId: string,
    roleOverride?: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const doctor = await this.staffRepository.findById(userId);

      if (!doctor) {
        throw new NotFoundError('Doctor not found', {
          code: ErrorCode.USER_NOT_FOUND,
        });
      }

      if (doctor.role !== StaffRole.DOCTOR) {
        throw new NotFoundError('Doctor not found', {
          code: ErrorCode.USER_NOT_FOUND,
        });
      }

      const role = roleOverride || StaffRole.DOCTOR;

      const result =
        await this.permissionAssignmentService.assignPermissionsToNewUser(
          userId,
          role as StaffRole,
        );

      this.logger.log(
        `Manual permission assignment completed for doctor ${doctor.email}: ${result.assignedPermissions.length} permissions`,
      );

      return {
        success: true,
        message: `Permissions assigned successfully. ${result.assignedPermissions.length} permissions granted.`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to manually assign permissions to doctor ${userId}:`,
        error.stack,
      );

      return {
        success: false,
        message: `Failed to assign permissions: ${error.message}`,
      };
    }
  }

  private mapToStaffAccountDto(staff: any): StaffAccountDto {
    return {
      id: staff.id,
      fullName: staff.fullName,
      email: staff.email,
      role: staff.role,
      phone: staff.phone,
      isMale: staff.isMale,
      dateOfBirth: staff.dateOfBirth,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
    };
  }
}
