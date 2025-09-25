import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RedisModule } from '@app/redis';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET', {
          infer: true,
        }),
        signOptions: {
          expiresIn: +configService.getOrThrow<number>('JWT_EXPIRES_IN', {
            infer: true,
          }),
        },
      }),
      inject: [ConfigService],
    }),
    RedisModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'ACCOUNTS_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.REDIS,
            options: {
              host: configService.get<string>('REDIS_HOST', { infer: true }),
              port:
                +configService.get<number>('REDIS_PORT', { infer: true }) ||
                6379,
              username: configService.get<string>('REDIS_USERNAME', {
                infer: true,
              }),
              password: configService.get<string>('REDIS_PASSWORD', {
                infer: true,
              }),
              db: parseInt(
                configService.get<string>('REDIS_DB', { infer: true }) || '0',
              ),
              retryAttempts: 5,
              retryDelay: 3000,
              maxRetriesPerRequest: 3,
              connectTimeout: 10000,
              lazyConnect: true,
            },
          };
        },
        inject: [ConfigService],
      },
      {
        name: 'PROVIDER_DIRECTORY_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.REDIS,
            options: {
              host: configService.get<string>('REDIS_HOST', { infer: true }),
              port:
                +configService.get<number>('REDIS_PORT', { infer: true }) ||
                6379,
              username: configService.get<string>('REDIS_USERNAME', {
                infer: true,
              }),
              password: configService.get<string>('REDIS_PASSWORD', {
                infer: true,
              }),
              db: parseInt(
                configService.get<string>('REDIS_DB', { infer: true }) || '0',
              ),
              retryAttempts: 5,
              retryDelay: 3000,
              maxRetriesPerRequest: 3,
              connectTimeout: 10000,
              lazyConnect: true,
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
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
      .forRoutes('*')
      .apply(PermissionMiddleware)
      .forRoutes('*');
  }
}
