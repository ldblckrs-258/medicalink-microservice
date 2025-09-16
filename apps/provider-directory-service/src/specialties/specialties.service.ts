import { Injectable } from '@nestjs/common';
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
import { NotFoundError, ConflictError, ErrorCode } from '@app/domain-errors';

@Injectable()
export class SpecialtiesService {
  constructor(
    private readonly specialtyRepository: SpecialtyRepository,
    private readonly specialtyInfoSectionRepository: SpecialtyInfoSectionRepository,
  ) {}

  async findAllPublic(
    query: SpecialtyQueryDto,
  ): Promise<SpecialtyPublicPaginatedResponseDto> {
    const { data, total } =
      await this.specialtyRepository.findManyPublic(query);
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
    const { data, total } =
      await this.specialtyRepository.findManyWithMetadata(query);
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
      throw new NotFoundError('Specialty not found', {
        code: ErrorCode.RECORD_NOT_FOUND,
      });
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
      throw new ConflictError('Specialty name already exists', {
        code: ErrorCode.UNIQUE_VIOLATION,
      });
    }

    const specialty = await this.specialtyRepository.create(createSpecialtyDto);
    return this.mapToSpecialtyResponseDto({
      ...specialty,
      infoSectionsCount: 0,
    });
  }

  async update(
    id: string,
    updateSpecialtyDto: UpdateSpecialtyDto,
  ): Promise<SpecialtyResponseDto> {
    // Check if specialty exists
    const existingSpecialty = await this.specialtyRepository.findById(id);

    if (!existingSpecialty) {
      throw new NotFoundError('Specialty not found', {
        code: ErrorCode.RECORD_NOT_FOUND,
      });
    }

    // Check if name is being updated and already exists
    if (
      updateSpecialtyDto.name &&
      updateSpecialtyDto.name !== existingSpecialty.name
    ) {
      const specialtyWithName = await this.specialtyRepository.findByName(
        updateSpecialtyDto.name,
      );

      if (specialtyWithName) {
        throw new ConflictError('Specialty name already exists', {
          code: ErrorCode.UNIQUE_VIOLATION,
        });
      }
    }

    await this.specialtyRepository.update(id, updateSpecialtyDto);
    const specialtyWithCount =
      await this.specialtyRepository.findByIdWithInfoSectionsCount(id);
    return this.mapToSpecialtyResponseDto({
      ...specialtyWithCount,
      infoSectionsCount: specialtyWithCount!._count.infoSections,
    });
  }

  async remove(id: string): Promise<SpecialtyResponseDto> {
    // Check if specialty exists
    const existingSpecialty = await this.specialtyRepository.findById(id);

    if (!existingSpecialty) {
      throw new NotFoundError('Specialty not found', {
        code: ErrorCode.RECORD_NOT_FOUND,
      });
    }

    const specialty = await this.specialtyRepository.delete(id);
    return this.mapToSpecialtyResponseDto({
      ...specialty,
      infoSectionsCount: 0,
    });
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
    };
  }

  async findBySlugWithInfoSections(
    slug: string,
  ): Promise<SpecialtyWithInfoSectionsResponseDto> {
    const specialty =
      await this.specialtyRepository.findBySlugWithInfoSections(slug);

    if (!specialty) {
      throw new NotFoundError('Specialty not found', {
        code: ErrorCode.RECORD_NOT_FOUND,
      });
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
      throw new NotFoundError('Specialty not found', {
        code: ErrorCode.RECORD_NOT_FOUND,
      });
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
      throw new NotFoundError('Specialty not found', {
        code: ErrorCode.RECORD_NOT_FOUND,
      });
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
      throw new NotFoundError('Info section not found', {
        code: ErrorCode.RECORD_NOT_FOUND,
      });
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
      throw new NotFoundError('Info section not found', {
        code: ErrorCode.RECORD_NOT_FOUND,
      });
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
}
