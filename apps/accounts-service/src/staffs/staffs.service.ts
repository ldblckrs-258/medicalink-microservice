import { Injectable, Logger } from '@nestjs/common';
import { ConflictError, NotFoundError, ErrorCode } from '@app/domain-errors';
import { StaffRepository } from './staff.repository';
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
export class StaffsService {
  private readonly logger = new Logger(StaffsService.name);

  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly permissionAssignmentService: PermissionAssignmentService,
  ) {}

  async findAll(query: StaffQueryDto): Promise<StaffPaginatedResponseDto> {
    const staffQuery = {
      ...query,
      role: query.role || StaffRole.ADMIN,
    };
    const { data, total } = await this.staffRepository.findMany(staffQuery);
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
      throw new NotFoundError('Staff member not found', {
        code: ErrorCode.USER_NOT_FOUND,
      });
    }

    return this.mapToStaffAccountDto(staff);
  }

  async create(createStaffDto: CreateStaffDto): Promise<StaffAccountDto> {
    // Check if email already exists
    const existingStaff = await this.staffRepository.findByEmail(
      createStaffDto.email,
    );

    if (existingStaff) {
      throw new ConflictError('Email already exists', {
        code: ErrorCode.USER_EMAIL_TAKEN,
      });
    }

    // Create staff account
    const staff = await this.staffRepository.create(createStaffDto);

    try {
      await this.permissionAssignmentService.assignPermissionsToNewUser(
        staff.id,
        staff.role,
      );
    } catch (error) {
      this.logger.error(
        `Failed to assign permissions to new staff ${staff.email}:`,
        error.stack,
      );
    }

    return this.mapToStaffAccountDto(staff);
  }

  async update(
    id: string,
    updateStaffDto: UpdateStaffDto,
  ): Promise<StaffAccountDto> {
    // Check if staff exists
    const existingStaff = await this.staffRepository.findById(id);

    if (!existingStaff) {
      throw new NotFoundError('Staff member not found', {
        code: ErrorCode.USER_NOT_FOUND,
      });
    }

    // Check if email is being updated and already exists
    if (updateStaffDto.email && updateStaffDto.email !== existingStaff.email) {
      const staffWithEmail = await this.staffRepository.findByEmail(
        updateStaffDto.email,
      );

      if (staffWithEmail) {
        throw new ConflictError('Email already exists', {
          code: ErrorCode.USER_EMAIL_TAKEN,
        });
      }
    }

    const staff = await this.staffRepository.update(id, updateStaffDto);
    return this.mapToStaffAccountDto(staff);
  }

  async remove(id: string): Promise<StaffAccountDto> {
    // Check if staff exists
    const existingStaff = await this.staffRepository.findById(id);

    if (!existingStaff) {
      throw new NotFoundError('Staff member not found', {
        code: ErrorCode.USER_NOT_FOUND,
      });
    }

    const staff = await this.staffRepository.softDelete(id);
    return this.mapToStaffAccountDto(staff);
  }

  async getStats(): Promise<StaffStatsDto> {
    return await this.staffRepository.getStats();
  }

  /**
   * Manual permission assignment for existing staff
   */
  async assignPermissionsToUser(
    userId: string,
    roleOverride?: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Get staff to determine role
      const staff = await this.staffRepository.findById(userId);

      if (!staff) {
        throw new NotFoundError('Staff member not found', {
          code: ErrorCode.USER_NOT_FOUND,
        });
      }

      const role = roleOverride || staff.role;

      const result =
        await this.permissionAssignmentService.assignPermissionsToNewUser(
          userId,
          role as StaffRole,
        );

      this.logger.log(
        `Manual permission assignment completed for ${staff.email}: ${result.assignedPermissions.length} permissions`,
      );

      return {
        success: true,
        message: `Permissions assigned successfully. ${result.assignedPermissions.length} permissions granted.`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to manually assign permissions to user ${userId}:`,
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
