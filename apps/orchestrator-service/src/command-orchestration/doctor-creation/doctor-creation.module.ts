import { Module } from '@nestjs/common';
import { DoctorCreationOrchestratorService } from './doctor-creation-orchestrator.service';
import { DoctorCreationController } from './doctor-creation.controller';
import { ClientsModule } from '../../clients/clients.module';
import { SagaModule } from '../../saga/saga.module';

@Module({
  imports: [ClientsModule, SagaModule],
  controllers: [DoctorCreationController],
  providers: [DoctorCreationOrchestratorService],
  exports: [DoctorCreationOrchestratorService],
})
export class DoctorCreationModule {}
