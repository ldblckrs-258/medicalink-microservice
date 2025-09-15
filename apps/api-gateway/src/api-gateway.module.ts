import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RedisModule } from '@app/redis';
import { JwtAuthGuard, RolesGuard } from '@app/contracts';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { AuthController } from './auth/auth.controller';
import { PatientsController } from './patients/patients.controller';
import { StaffsController } from './staffs/staffs.controller';
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
    ]),
  ],
  controllers: [
    ApiGatewayController,
    AuthController,
    PatientsController,
    StaffsController,
  ],
  providers: [
    ApiGatewayService,
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
      useClass: RolesGuard,
    },
  ],
})
export class ApiGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MorganMiddleware).forRoutes('*');
  }
}
