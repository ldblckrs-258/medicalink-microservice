import { Injectable, Logger } from '@nestjs/common';
import { ConflictError, NotFoundError, ErrorCode } from '@app/domain-errors';
import { StaffRepository } from './staff.repository';
import { PermissionAssignmentService } from '../permission/permission-assignment.service';
import { StaffAccount, StaffRole } from '../../prisma/generated/client';
import {
  CreateAccountDto,
  UpdateStaffDto,
  StaffQueryDto,
  StaffStatsDto,
  PaginatedResponse,
} from '@app/contracts';

@Injectable()
export class StaffsService {
  private readonly logger = new Logger(StaffsService.name);

  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly permissionAssignmentService: PermissionAssignmentService,
  ) {}

  async findAll(
    query: StaffQueryDto,
  ): Promise<PaginatedResponse<StaffAccount>> {
    const staffQuery = {
      ...query,
      role: query.role || StaffRole.ADMIN,
    };
    const { data, total } = await this.staffRepository.findMany(staffQuery);
    const { page = 1, limit = 10 } = query;

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

  async findOne(id: string): Promise<StaffAccount> {
    const staff = await this.staffRepository.findById(id);

    if (!staff) {
      throw new NotFoundError('Staff member not found', {
        code: ErrorCode.USER_NOT_FOUND,
      });
    }

    return staff;
  }

  async create(createAccountDto: CreateAccountDto): Promise<StaffAccount> {
    // Check if email already exists
    const existingStaff = await this.staffRepository.findByEmail(
      createAccountDto.email,
    );

    if (existingStaff) {
      throw new ConflictError('Email already exists', {
        code: ErrorCode.USER_EMAIL_TAKEN,
      });
    }

    // Create staff account
    const staff = await this.staffRepository.create(createAccountDto);

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

    return staff;
  }

  async update(
    id: string,
    updateStaffDto: UpdateStaffDto,
  ): Promise<StaffAccount> {
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
    return staff;
  }

  async remove(id: string): Promise<StaffAccount> {
    // Check if staff exists
    const existingStaff = await this.staffRepository.findById(id);

    if (!existingStaff) {
      throw new NotFoundError('Staff member not found', {
        code: ErrorCode.USER_NOT_FOUND,
      });
    }

    const staff = await this.staffRepository.softDelete(id);
    return staff;
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
}
