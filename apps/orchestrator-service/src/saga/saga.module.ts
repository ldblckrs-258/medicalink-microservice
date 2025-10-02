import { Module } from '@nestjs/common';
import { SagaOrchestratorService } from './saga-orchestrator.service';

@Module({
  providers: [SagaOrchestratorService],
  exports: [SagaOrchestratorService],
})
export class SagaModule {}
