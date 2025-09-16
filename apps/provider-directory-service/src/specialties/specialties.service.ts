import { Injectable } from '@nestjs/common';
import { SpecialtyRepository } from './specialty.repository';
import {
  CreateSpecialtyDto,
  UpdateSpecialtyDto,
  SpecialtyQueryDto,
  SpecialtyResponseDto,
  SpecialtyPaginatedResponseDto,
} from '@app/contracts';
import { NotFoundError, ConflictError, ErrorCode } from '@app/domain-errors';

@Injectable()
export class SpecialtiesService {
  constructor(private readonly specialtyRepository: SpecialtyRepository) {}

  async findAll(
    query: SpecialtyQueryDto,
  ): Promise<SpecialtyPaginatedResponseDto> {
    const { data, total } = await this.specialtyRepository.findMany(query);
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
    const specialty = await this.specialtyRepository.findById(id);

    if (!specialty) {
      throw new NotFoundError('Specialty not found', {
        code: ErrorCode.RECORD_NOT_FOUND,
      });
    }

    return this.mapToSpecialtyResponseDto(specialty);
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
    return this.mapToSpecialtyResponseDto(specialty);
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

    const specialty = await this.specialtyRepository.update(
      id,
      updateSpecialtyDto,
    );
    return this.mapToSpecialtyResponseDto(specialty);
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
    return this.mapToSpecialtyResponseDto(specialty);
  }

  async getStats(): Promise<{
    total: number;
    recentlyCreated: number;
  }> {
    return this.specialtyRepository.getStats();
  }

  private mapToSpecialtyResponseDto(specialty: any): SpecialtyResponseDto {
    return {
      id: specialty.id,
      name: specialty.name,
      slug: specialty.slug,
      description: specialty.description,
      createdAt: specialty.createdAt,
      updatedAt: specialty.updatedAt,
    };
  }
}
