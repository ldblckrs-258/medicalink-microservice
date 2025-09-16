import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WorkLocationsService } from './work-locations.service';
import {
  CreateWorkLocationDto,
  UpdateWorkLocationDto,
  WorkLocationQueryDto,
  WorkLocationResponseDto,
  WorkLocationPaginatedResponseDto,
} from '@app/contracts';

@Controller()
export class WorkLocationsController {
  constructor(private readonly workLocationsService: WorkLocationsService) {}

  @MessagePattern('work-locations.findAll')
  async findAll(
    @Payload() query: WorkLocationQueryDto,
  ): Promise<WorkLocationPaginatedResponseDto> {
    return this.workLocationsService.findAll(query);
  }

  @MessagePattern('work-locations.findOne')
  async findOne(@Payload() id: string): Promise<WorkLocationResponseDto> {
    return this.workLocationsService.findOne(id);
  }

  @MessagePattern('work-locations.create')
  async create(
    @Payload() createWorkLocationDto: CreateWorkLocationDto,
  ): Promise<WorkLocationResponseDto> {
    return this.workLocationsService.create(createWorkLocationDto);
  }

  @MessagePattern('work-locations.update')
  async update(
    @Payload() payload: { id: string; data: UpdateWorkLocationDto },
  ): Promise<WorkLocationResponseDto> {
    return this.workLocationsService.update(payload.id, payload.data);
  }

  @MessagePattern('work-locations.remove')
  async remove(@Payload() id: string): Promise<WorkLocationResponseDto> {
    return this.workLocationsService.remove(id);
  }

  @MessagePattern('work-locations.stats')
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    recentlyCreated: number;
  }> {
    return this.workLocationsService.getStats();
  }
}
