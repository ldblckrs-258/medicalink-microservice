import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { BookingServiceModule } from './booking-service.module';
import { RabbitMQConfig, QUEUE_NAMES } from '@app/rabbitmq';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RpcDomainErrorFilter } from '@app/error-adapters';

async function bootstrap() {
  const app = await NestFactory.create(BookingServiceModule);
  app.useGlobalFilters(new RpcDomainErrorFilter());

  const configService = app.get(ConfigService);
  app.connectMicroservice<MicroserviceOptions>(
    RabbitMQConfig.createServerConfig(configService, QUEUE_NAMES.BOOKING_QUEUE),
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  await app.init();
  Logger.verbose('Booking Service is listening on RabbitMQ...');
}

bootstrap().catch((error) => {
  Logger.error('Failed to start Booking Service:', error);
  process.exit(1);
});
