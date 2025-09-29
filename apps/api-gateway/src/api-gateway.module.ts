import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RedisModule } from '@app/redis';
import { RabbitMQModule } from '@app/rabbitmq';
import { JwtAuthGuard, PermissionGuard } from '@app/contracts';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { AuthController } from './auth/auth.controller';
import { PatientsController } from './patients/patients.controller';
import { StaffsController } from './staffs/staffs.controller';
import { DoctorsController } from './doctors/doctors.controller';
import { DoctorProfileController } from './doctors/doctor-profile.controller';
import { SpecialtiesController } from './specialties/specialties.controller';
import { WorkLocationsController } from './work-locations/work-locations.controller';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { MicroserviceService } from './utils/microservice.service';
import { PermissionService } from './auth/permission.service';
import { PermissionMiddleware } from './middleware/permission.middleware';
import { MicroserviceErrorInterceptor } from './interceptors/microservice-error.interceptor';
import { PermissionsController } from './permissions/permissions.controller';
import { MorganMiddleware } from './middleware';
import { jwtModuleAsyncOptions } from './auth/jwt.config';
import { throttlerOptions } from './config/throttler.config';
import { MicroserviceClientsModule } from './clients/microservice-clients.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.registerAsync(jwtModuleAsyncOptions),
    RedisModule,
    RabbitMQModule,
    ThrottlerModule.forRoot(throttlerOptions),
    MicroserviceClientsModule,
  ],
  controllers: [
    ApiGatewayController,
    AuthController,
    PermissionsController,
    StaffsController,
    DoctorProfileController,
    DoctorsController,
    SpecialtiesController,
    WorkLocationsController,
    PatientsController,
    HealthController,
  ],
  providers: [
    ApiGatewayService,
    HealthService,
    MicroserviceService,
    PermissionService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MicroserviceErrorInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class ApiGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MorganMiddleware)
      .forRoutes('(.*)')
      .apply(PermissionMiddleware)
      .forRoutes('(.*)');
  }
}
