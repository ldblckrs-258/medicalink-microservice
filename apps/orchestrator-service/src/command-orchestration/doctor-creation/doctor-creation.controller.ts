import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { DoctorCreationOrchestratorService } from './doctor-creation-orchestrator.service';
import { CreateDoctorCommandDto, DoctorCreationResultDto } from './dto';
import { ORCHESTRATOR_PATTERNS } from '../../common/constants';

@Controller()
export class DoctorCreationController {
  private readonly logger = new Logger(DoctorCreationController.name);

  constructor(
    private readonly orchestratorService: DoctorCreationOrchestratorService,
  ) {}

  @MessagePattern(ORCHESTRATOR_PATTERNS.DOCTOR_CREATE)
  async createDoctor(
    command: CreateDoctorCommandDto,
  ): Promise<DoctorCreationResultDto> {
    this.logger.log(`Received doctor creation request for: ${command.email}`);

    // Service will throw SagaOrchestrationError if failed
    // Interceptor will catch and format the error
    const result = await this.orchestratorService.createDoctor(command);

    this.logger.log(`Doctor created successfully: ${result.account.id}`);
    return result;
  }
}
