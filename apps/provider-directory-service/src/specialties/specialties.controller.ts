import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SpecialtiesService } from './specialties.service';
import {
  CreateSpecialtyDto,
  UpdateSpecialtyDto,
  SpecialtyQueryDto,
  SpecialtyResponseDto,
  SpecialtyPaginatedResponseDto,
  SpecialtyPublicPaginatedResponseDto,
  SpecialtyWithInfoSectionsResponseDto,
  CreateSpecialtyInfoSectionDto,
  UpdateSpecialtyInfoSectionDto,
  SpecialtyInfoSectionResponseDto,
} from '@app/contracts';

@Controller()
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @MessagePattern('specialties.findAllPublic')
  async findAll(
    @Payload() query: SpecialtyQueryDto,
  ): Promise<SpecialtyPublicPaginatedResponseDto> {
    return this.specialtiesService.findAllPublic(query);
  }

  @MessagePattern('specialties.findAllAdmin')
  async findAllAdmin(
    @Payload() query: SpecialtyQueryDto,
  ): Promise<SpecialtyPaginatedResponseDto> {
    return this.specialtiesService.findAllAdmin(query);
  }

  @MessagePattern('specialties.findOne')
  async findOne(@Payload() id: string): Promise<SpecialtyResponseDto> {
    return this.specialtiesService.findOne(id);
  }

  @MessagePattern('specialties.findBySlug')
  async findBySlug(
    @Payload() slug: string,
  ): Promise<SpecialtyWithInfoSectionsResponseDto> {
    return this.specialtiesService.findBySlugWithInfoSections(slug);
  }

  @MessagePattern('specialties.create')
  async create(
    @Payload() createSpecialtyDto: CreateSpecialtyDto,
  ): Promise<SpecialtyResponseDto> {
    return this.specialtiesService.create(createSpecialtyDto);
  }

  @MessagePattern('specialties.update')
  async update(
    @Payload() payload: { id: string; data: UpdateSpecialtyDto },
  ): Promise<SpecialtyResponseDto> {
    return this.specialtiesService.update(payload.id, payload.data);
  }

  @MessagePattern('specialties.remove')
  async remove(@Payload() id: string): Promise<SpecialtyResponseDto> {
    return this.specialtiesService.remove(id);
  }

  @MessagePattern('specialties.stats')
  async getStats(): Promise<{
    total: number;
    recentlyCreated: number;
  }> {
    return this.specialtiesService.getStats();
  }

  @MessagePattern('specialties.findInfoSectionsBySpecialtyId')
  async findInfoSectionsBySpecialtyId(
    @Payload() specialtyId: string,
  ): Promise<SpecialtyInfoSectionResponseDto[]> {
    return this.specialtiesService.findInfoSectionsBySpecialtyId(specialtyId);
  }

  @MessagePattern('specialties.createInfoSection')
  async createInfoSection(
    @Payload()
    payload: CreateSpecialtyInfoSectionDto,
  ): Promise<SpecialtyInfoSectionResponseDto> {
    return this.specialtiesService.createInfoSection(payload);
  }

  @MessagePattern('specialties.updateInfoSection')
  async updateInfoSection(
    @Payload() payload: { id: string; data: UpdateSpecialtyInfoSectionDto },
  ): Promise<SpecialtyInfoSectionResponseDto> {
    return this.specialtiesService.updateInfoSection(payload.id, payload.data);
  }

  @MessagePattern('specialties.deleteInfoSection')
  async deleteInfoSection(
    @Payload() id: string,
  ): Promise<SpecialtyInfoSectionResponseDto> {
    return this.specialtiesService.deleteInfoSection(id);
  }
}
