import { Injectable, Logger } from '@nestjs/common';
import { DoctorRepository } from './doctor.repository';
import {
  CreateDoctorProfileDto,
  UpdateDoctorProfileDto,
  DoctorProfileQueryDto,
  GetDoctorsByAccountIdsDto,
  PaginatedResponse,
  DoctorProfileResponseDto,
} from '@app/contracts';
import { NotFoundError } from '@app/domain-errors';
import { RabbitMQService } from '@app/rabbitmq';
import { extractPublicIdFromUrl } from '../utils/extractor';

@Injectable()
export class DoctorsService {
  private readonly logger = new Logger(DoctorsService.name);

  constructor(
    private readonly doctorRepo: DoctorRepository,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async create(
    createDoctorDto: CreateDoctorProfileDto,
  ): Promise<DoctorProfileResponseDto> {
    const result = await this.doctorRepo.create(createDoctorDto);

    // Emit doctor profile created event for cache invalidation and asset management
    try {
      const assets = this.extractAssetPublicIds(result);
      this.rabbitMQService.emitEvent('doctor.profile.created', {
        profileId: result.id,
        staffAccountId: result.staffAccountId,
        assets,
      });
      this.logger.debug(
        `Emitted doctor.profile.created event for doctor ${result.id} with ${assets.length} assets`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to emit doctor.profile.created event: ${error.message}`,
      );
      // Don't throw error to avoid breaking the main operation
    }

    return result;
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

    if (filters?.specialtyIds && filters.specialtyIds.length > 0) {
      where.doctorSpecialties = {
        some: {
          specialtyId: {
            in: filters.specialtyIds,
          },
        },
      };
    }

    if (filters?.workLocationIds && filters.workLocationIds.length > 0) {
      where.doctorWorkLocations = {
        some: {
          locationId: {
            in: filters.workLocationIds,
          },
        },
      };
    }

    const { data, total } = await this.doctorRepo.findManyPublic(
      where,
      {},
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
      schedules: { where: { serviceDate: { gte: new Date() } } },
    });

    if (!doctor) {
      throw new NotFoundError(`Doctor profile with id ${id} not found`);
    }

    return doctor;
  }

  async update(
    id: string,
    updateDoctorDto: Omit<UpdateDoctorProfileDto, 'id'>,
  ): Promise<DoctorProfileResponseDto> {
    // Check if doctor exists first and get current data for asset comparison
    const existing = await this.doctorRepo.findOne(id);
    if (!existing) {
      throw new NotFoundError(`Doctor profile with id ${id} not found`);
    }

    // Extract current asset URLs for comparison
    const prevAssets = this.extractAssetPublicIds(existing);

    const result = await this.doctorRepo.update(id, updateDoctorDto);

    // Extract new asset URLs
    const nextAssets = this.extractAssetPublicIds(result);

    // Emit doctor profile updated event for cache invalidation and asset management
    try {
      this.rabbitMQService.emitEvent('doctor.profile.updated', {
        profileId: result.id,
        staffAccountId: result.staffAccountId,
        prevAssets,
        nextAssets,
      });
      this.logger.log(
        `Emitted doctor.profile.updated event for doctor ${result.id} (prev: ${prevAssets.length}, next: ${nextAssets.length} assets)`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to emit doctor.profile.updated event for doctor ${result.id}:`,
        error,
      );
    }

    return result;
  }

  async remove(id: string): Promise<DoctorProfileResponseDto> {
    // Check if doctor exists first and get asset data for cleanup
    const existing = await this.doctorRepo.findOne(id);
    if (!existing) {
      throw new NotFoundError(`Doctor profile with id ${id} not found`);
    }

    // Extract asset URLs for cleanup
    const assetPublicIds = this.extractAssetPublicIds(existing);

    const result = await this.doctorRepo.remove(id);

    // Emit doctor profile deleted event for asset cleanup
    try {
      this.rabbitMQService.emitEvent('doctor.profile.deleted', {
        profileId: id,
        assetPublicIds,
      });
      this.logger.log(
        `Emitted doctor.profile.deleted event for doctor ${id} with ${assetPublicIds.length} assets for cleanup`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to emit doctor.profile.deleted event for doctor ${id}:`,
        error,
      );
    }

    return result;
  }

  async toggleActive(
    id: string,
    active?: boolean,
  ): Promise<DoctorProfileResponseDto> {
    const doctor = await this.doctorRepo.toggleActive(id, active);

    if (!doctor) {
      throw new NotFoundError(`Doctor profile with id ${id} not found`);
    }

    // Emit doctor profile updated event for cache invalidation and asset management
    try {
      this.rabbitMQService.emitEvent('doctor.profile.updated', {
        profileId: doctor.id,
        staffAccountId: doctor.staffAccountId,
      });
      this.logger.log(
        `Emitted doctor.profile.updated event for doctor ${doctor.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to emit doctor.profile.updated event for doctor ${doctor.id}:`,
        error,
      );
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
      ...(payload.isActive !== undefined && { isActive: payload.isActive }),
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

    return this.doctorRepo.findAll(where);
  }

  /**
   * Get doctor profile by staff account ID
   * Used by orchestrator service for read composition
   */
  async getByAccountId(
    staffAccountId: string,
  ): Promise<DoctorProfileResponseDto> {
    const doctor = await this.doctorRepo.findOneByStaffAccountId({
      staffAccountId,
    });

    if (!doctor) {
      throw new NotFoundError(
        `Doctor profile with staff account ID ${staffAccountId} not found`,
      );
    }

    return doctor;
  }

  /**
   * Extract Cloudinary public IDs from doctor profile URLs
   */
  private extractAssetPublicIds(doctor: DoctorProfileResponseDto): string[] {
    const publicIds: string[] = [];

    if (doctor.avatarUrl) {
      const publicId = extractPublicIdFromUrl(doctor.avatarUrl);
      if (publicId) publicIds.push(publicId);
    }

    if (doctor.portrait) {
      const publicId = extractPublicIdFromUrl(doctor.portrait);
      if (publicId) publicIds.push(publicId);
    }

    return publicIds;
  }
}
