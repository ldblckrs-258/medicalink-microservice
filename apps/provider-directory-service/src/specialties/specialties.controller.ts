import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SpecialtiesService } from './specialties.service';
import {
  CreateSpecialtyDto,
  UpdateSpecialtyDto,
  SpecialtyQueryDto,
  SpecialtyResponseDto,
  SpecialtyPaginatedResponseDto,
} from '@app/contracts';

@Controller()
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @MessagePattern('specialties.findAll')
  async findAll(
    @Payload() query: SpecialtyQueryDto,
  ): Promise<SpecialtyPaginatedResponseDto> {
    return this.specialtiesService.findAll(query);
  }

  @MessagePattern('specialties.findOne')
  async findOne(@Payload() id: string): Promise<SpecialtyResponseDto> {
    return this.specialtiesService.findOne(id);
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
}
