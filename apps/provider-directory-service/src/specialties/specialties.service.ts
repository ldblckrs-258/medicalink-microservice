import { Injectable, Logger } from '@nestjs/common';
import { SpecialtyRepository } from './specialty.repository';
import { SpecialtyInfoSectionRepository } from './specialty-info-section.repository';
import {
  CreateSpecialtyDto,
  UpdateSpecialtyDto,
  SpecialtyQueryDto,
  SpecialtyResponseDto,
  SpecialtyPaginatedResponseDto,
  SpecialtyPublicResponseDto,
  SpecialtyPublicPaginatedResponseDto,
  SpecialtyWithInfoSectionsResponseDto,
  CreateSpecialtyInfoSectionDto,
  UpdateSpecialtyInfoSectionDto,
  SpecialtyInfoSectionResponseDto,
} from '@app/contracts';
import { NotFoundError, ConflictError } from '@app/domain-errors';
import { RabbitMQService } from '@app/rabbitmq';
import { ORCHESTRATOR_EVENTS } from '@app/contracts/patterns';
import { extractPublicIdFromUrl } from '@app/commons/utils';

@Injectable()
export class SpecialtiesService {
  private readonly logger = new Logger(SpecialtiesService.name);

  constructor(
    private readonly specialtyRepository: SpecialtyRepository,
    private readonly specialtyInfoSectionRepository: SpecialtyInfoSectionRepository,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async findAllPublic(
    query: SpecialtyQueryDto,
  ): Promise<SpecialtyPublicPaginatedResponseDto> {
    const publicQuery = {
      ...query,
      isActive: true,
      includeMetadata: false,
    };
    const { data, total } = await this.specialtyRepository.findAll(publicQuery);
    const { page = 1, limit = 10 } = query;

    return {
      data: data.map((specialty) =>
        this.mapToSpecialtyPublicResponseDto(specialty),
      ),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findAllAdmin(
    query: SpecialtyQueryDto,
  ): Promise<SpecialtyPaginatedResponseDto> {
    const { data, total } = await this.specialtyRepository.findAll(query);
    const { page = 1, limit = 10 } = query;

    return {
      data: data.map((specialty) => this.mapToSpecialtyResponseDto(specialty)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<SpecialtyResponseDto> {
    const specialty =
      await this.specialtyRepository.findByIdWithInfoSectionsCount(id);

    if (!specialty) {
      throw new NotFoundError('Specialty not found');
    }

    return this.mapToSpecialtyResponseDto({
      ...specialty,
      infoSectionsCount: specialty._count.infoSections,
    });
  }

  async create(
    createSpecialtyDto: CreateSpecialtyDto,
  ): Promise<SpecialtyResponseDto> {
    // Check if specialty name already exists
    const existingSpecialty = await this.specialtyRepository.findByName(
      createSpecialtyDto.name,
    );

    if (existingSpecialty) {
      throw new ConflictError('Specialty name already exists');
    }

    const specialty = await this.specialtyRepository.create(createSpecialtyDto);
    const specialtyResponse = this.mapToSpecialtyResponseDto({
      ...specialty,
      infoSectionsCount: 0,
    });

    // Emit SPECIALTY_CREATED event for asset management
    try {
      const iconAssets = this.extractAssetPublicIds(specialtyResponse);

      this.rabbitMQService.emitEvent(ORCHESTRATOR_EVENTS.SPECIALTY_CREATED, {
        specialtyId: specialtyResponse.id,
        iconAssets,
        assetPublicIds: iconAssets,
      });

      this.logger.log(
        `Emitted SPECIALTY_CREATED event for specialty ${specialtyResponse.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to emit SPECIALTY_CREATED event: ${error.message}`,
      );
    }

    return specialtyResponse;
  }

  async update(
    id: string,
    updateSpecialtyDto: UpdateSpecialtyDto,
  ): Promise<SpecialtyResponseDto> {
    // Check if specialty exists
    const existingSpecialty = await this.specialtyRepository.findById(id);

    if (!existingSpecialty) {
      throw new NotFoundError('Specialty not found');
    }

    // Get previous asset public IDs for comparison
    const prevSpecialtyResponse = this.mapToSpecialtyResponseDto({
      ...existingSpecialty,
      infoSectionsCount: 0,
    });
    const prevIconAssets = this.extractAssetPublicIds(prevSpecialtyResponse);

    // Check if name is being updated and already exists
    if (
      updateSpecialtyDto.name &&
      updateSpecialtyDto.name !== existingSpecialty.name
    ) {
      const specialtyWithName = await this.specialtyRepository.findByName(
        updateSpecialtyDto.name,
      );

      if (specialtyWithName) {
        throw new ConflictError('Specialty name already exists');
      }
    }

    await this.specialtyRepository.update(id, updateSpecialtyDto);
    const specialtyWithCount =
      await this.specialtyRepository.findByIdWithInfoSectionsCount(id);
    const specialtyResponse = this.mapToSpecialtyResponseDto({
      ...specialtyWithCount,
      infoSectionsCount: specialtyWithCount!._count.infoSections,
    });

    // Emit SPECIALTY_UPDATED event for asset management
    try {
      const nextIconAssets = this.extractAssetPublicIds(specialtyResponse);

      this.rabbitMQService.emitEvent(ORCHESTRATOR_EVENTS.SPECIALTY_UPDATED, {
        specialtyId: specialtyResponse.id,
        iconAssets: nextIconAssets,
        prevIconAssets,
        nextIconAssets,
        assetPublicIds: nextIconAssets,
      });

      this.logger.log(
        `Emitted SPECIALTY_UPDATED event for specialty ${specialtyResponse.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to emit SPECIALTY_UPDATED event: ${error.message}`,
      );
    }

    return specialtyResponse;
  }

  async remove(id: string): Promise<SpecialtyResponseDto> {
    // Check if specialty exists
    const existingSpecialty = await this.specialtyRepository.findById(id);

    if (!existingSpecialty) {
      throw new NotFoundError('Specialty not found');
    }

    // Get asset public IDs before deletion
    const specialtyResponse = this.mapToSpecialtyResponseDto({
      ...existingSpecialty,
      infoSectionsCount: 0,
    });
    const iconAssets = this.extractAssetPublicIds(specialtyResponse);

    const specialty = await this.specialtyRepository.delete(id);
    const deletedSpecialtyResponse = this.mapToSpecialtyResponseDto({
      ...specialty,
      infoSectionsCount: 0,
    });

    // Emit SPECIALTY_DELETED event for asset management
    try {
      this.rabbitMQService.emitEvent(ORCHESTRATOR_EVENTS.SPECIALTY_DELETED, {
        specialtyId: deletedSpecialtyResponse.id,
        iconAssets,
        assetPublicIds: iconAssets,
      });

      this.logger.log(
        `Emitted SPECIALTY_DELETED event for specialty ${deletedSpecialtyResponse.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to emit SPECIALTY_DELETED event: ${error.message}`,
      );
    }

    return deletedSpecialtyResponse;
  }

  async getStats(): Promise<{
    total: number;
    recentlyCreated: number;
  }> {
    return this.specialtyRepository.getStats();
  }

  private mapToSpecialtyResponseDto(specialty: any): SpecialtyResponseDto {
    const baseDto = {
      id: specialty.id,
      name: specialty.name,
      slug: specialty.slug,
      description: specialty.description,
      iconUrl: specialty.iconUrl,
      isActive: specialty.isActive,
      infoSectionsCount: specialty.infoSectionsCount || 0,
    };

    // Only include timestamps if they exist (when includeMetadata is true)
    if (specialty.createdAt && specialty.updatedAt) {
      return {
        ...baseDto,
        createdAt: specialty.createdAt,
        updatedAt: specialty.updatedAt,
      };
    }

    // For public endpoints without metadata, return without timestamps
    return {
      ...baseDto,
      createdAt: new Date(), // Provide default values to satisfy DTO interface
      updatedAt: new Date(),
    };
  }

  private mapToSpecialtyPublicResponseDto(
    specialty: any,
  ): SpecialtyPublicResponseDto {
    return {
      id: specialty.id,
      name: specialty.name,
      slug: specialty.slug,
      description: specialty.description,
      iconUrl: specialty.iconUrl,
    };
  }

  async findBySlugWithInfoSections(
    slug: string,
  ): Promise<SpecialtyWithInfoSectionsResponseDto> {
    const specialty =
      await this.specialtyRepository.findBySlugWithInfoSections(slug);

    if (!specialty) {
      throw new NotFoundError('Specialty not found');
    }

    return {
      id: specialty.id,
      name: specialty.name,
      slug: specialty.slug,
      description: specialty.description || undefined,
      infoSections: specialty.infoSections.map((section: any) => ({
        id: section.id,
        specialtyId: section.specialtyId,
        name: section.name,
        content: section.content || undefined,
        createdAt: section.createdAt,
        updatedAt: section.updatedAt,
      })),
    };
  }

  async findInfoSectionsBySpecialtyId(
    specialtyId: string,
  ): Promise<SpecialtyInfoSectionResponseDto[]> {
    // Check if specialty exists
    const specialty = await this.specialtyRepository.findById(specialtyId);
    if (!specialty) {
      throw new NotFoundError('Specialty not found');
    }

    const infoSections =
      await this.specialtyInfoSectionRepository.findManyBySpecialtyId(
        specialtyId,
      );

    return infoSections.map((section) => ({
      id: section.id,
      specialtyId: section.specialtyId,
      name: section.name,
      content: section.content || undefined,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
    }));
  }

  async createInfoSection(
    createInfoSectionDto: CreateSpecialtyInfoSectionDto,
  ): Promise<SpecialtyInfoSectionResponseDto> {
    // Check if specialty exists
    const specialty = await this.specialtyRepository.findById(
      createInfoSectionDto.specialtyId,
    );
    if (!specialty) {
      throw new NotFoundError('Specialty not found');
    }

    const infoSection =
      await this.specialtyInfoSectionRepository.create(createInfoSectionDto);

    return {
      id: infoSection.id,
      specialtyId: infoSection.specialtyId,
      name: infoSection.name,
      content: infoSection.content || undefined,
      createdAt: infoSection.createdAt,
      updatedAt: infoSection.updatedAt,
    };
  }

  async updateInfoSection(
    id: string,
    updateInfoSectionDto: UpdateSpecialtyInfoSectionDto,
  ): Promise<SpecialtyInfoSectionResponseDto> {
    // Check if info section exists
    const existingInfoSection =
      await this.specialtyInfoSectionRepository.findById(id);
    if (!existingInfoSection) {
      throw new NotFoundError('Info section not found');
    }

    const infoSection = await this.specialtyInfoSectionRepository.update(
      id,
      updateInfoSectionDto,
    );

    return {
      id: infoSection.id,
      specialtyId: infoSection.specialtyId,
      name: infoSection.name,
      content: infoSection.content || undefined,
      createdAt: infoSection.createdAt,
      updatedAt: infoSection.updatedAt,
    };
  }

  async deleteInfoSection(
    id: string,
  ): Promise<SpecialtyInfoSectionResponseDto> {
    // Check if info section exists
    const existingInfoSection =
      await this.specialtyInfoSectionRepository.findById(id);
    if (!existingInfoSection) {
      throw new NotFoundError('Info section not found');
    }

    const infoSection = await this.specialtyInfoSectionRepository.delete(id);

    return {
      id: infoSection.id,
      specialtyId: infoSection.specialtyId,
      name: infoSection.name,
      content: infoSection.content || undefined,
      createdAt: infoSection.createdAt,
      updatedAt: infoSection.updatedAt,
    };
  }

  /**
   * Extract asset public IDs from specialty data
   */
  private extractAssetPublicIds(specialty: SpecialtyResponseDto): string[] {
    const assets: string[] = [];

    if (specialty.iconUrl) {
      const publicId = extractPublicIdFromUrl(specialty.iconUrl);
      if (publicId && typeof publicId === 'string') {
        assets.push(publicId);
      }
    }

    return assets;
  }
}
