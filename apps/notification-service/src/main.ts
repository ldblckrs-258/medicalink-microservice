import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { NotificationServiceModule } from './notification-service.module';
import { RabbitMQConfig, QUEUE_NAMES } from '@app/rabbitmq';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RpcDomainErrorFilter } from '@app/error-adapters';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);
  app.useGlobalFilters(new RpcDomainErrorFilter());

  const configService = app.get(ConfigService);
  app.connectMicroservice<MicroserviceOptions>(
    RabbitMQConfig.createServerConfig(
      configService,
      QUEUE_NAMES.NOTIFICATION_QUEUE,
    ),
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  await app.init();
  Logger.verbose('Notification Service is listening on RabbitMQ...');
}

bootstrap().catch((error) => {
  Logger.error('Failed to start Notification Service:', error);
  process.exit(1);
});
