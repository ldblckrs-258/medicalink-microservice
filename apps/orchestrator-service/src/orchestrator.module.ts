import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@app/redis';
import { OrchestratorConfigModule } from './config';
import { HealthModule } from './health/health.module';
import { ClientsModule } from './clients/clients.module';
import { CacheModule } from './cache/cache.module';
import { SagaModule } from './saga/saga.module';
import { DoctorCreationModule } from './command-orchestration/doctor-creation';
import { DoctorCompositeModule } from './read-composition';
import { EventHandlersModule } from './event-handlers';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    OrchestratorConfigModule,
    HealthModule,
    ClientsModule,
    CacheModule,
    SagaModule,
    DoctorCreationModule,
    DoctorCompositeModule,
    EventHandlersModule,
  ],
})
export class OrchestratorModule {}
