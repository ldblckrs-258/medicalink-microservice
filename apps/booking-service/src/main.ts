import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { BookingServiceModule } from './booking-service.module';
import { RabbitMQConfig, QUEUE_NAMES } from '@app/rabbitmq';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { RpcDomainErrorFilter } from '@app/error-adapters';
import { PrismaService } from '../prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(BookingServiceModule);
  app.useGlobalFilters(new RpcDomainErrorFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have any decorators
      transform: true, // Transform payloads to be objects typed according to their DTO classes
      forbidNonWhitelisted: true, // Throw errors if non-whitelisted values are provided
    }),
  );

  const configService = app.get(ConfigService);
  app.connectMicroservice<MicroserviceOptions>(
    RabbitMQConfig.createServerConfig(configService, QUEUE_NAMES.BOOKING_QUEUE),
    { inheritAppConfig: true },
  );

  // Enable Prisma shutdown hooks
  const prisma = app.get(PrismaService);
  prisma.enableShutdownHooks(app);

  await app.startAllMicroservices();
  await app.init();
  Logger.verbose('Booking Service is listening on RabbitMQ...');
}

bootstrap().catch((error) => {
  Logger.error('Failed to start Booking Service:', error);
  process.exit(1);
});
