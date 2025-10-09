import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { DoctorOrchestratorService } from './doctor-orchestrator.service';
import { CreateDoctorCommandDto, DoctorCreationResultDto } from './dto';
import { ORCHESTRATOR_PATTERNS } from '../../common/constants';

@Controller()
export class DoctorOrchestratorController {
  constructor(
    private readonly orchestratorService: DoctorOrchestratorService,
  ) {}

  @MessagePattern(ORCHESTRATOR_PATTERNS.DOCTOR_CREATE)
  async createDoctor(
    command: CreateDoctorCommandDto,
  ): Promise<DoctorCreationResultDto> {
    return this.orchestratorService.createDoctor(command);
  }
}
