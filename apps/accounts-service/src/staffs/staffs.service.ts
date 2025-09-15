import { Injectable } from '@nestjs/common';
import { ConflictError, NotFoundError, ErrorCode } from '@app/domain-errors';
import { StaffRepository } from './staff.repository';
import {
  CreateStaffDto,
  UpdateStaffDto,
  StaffQueryDto,
  StaffAccountDto,
  StaffPaginatedResponseDto,
} from '@app/contracts';

@Injectable()
export class StaffsService {
  constructor(private readonly staffRepository: StaffRepository) {}

  async findAll(query: StaffQueryDto): Promise<StaffPaginatedResponseDto> {
    const { data, total } = await this.staffRepository.findMany(query);
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

    const staff = await this.staffRepository.create(createStaffDto);
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
