import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { HealthService } from './health.service';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @MessagePattern('orchestrator.health.check')
  checkHealth() {
    return this.healthService.check();
  }

  @MessagePattern('orchestrator.health.ping')
  ping() {
    return { status: 'ok', service: 'orchestrator', timestamp: new Date() };
  }
}
