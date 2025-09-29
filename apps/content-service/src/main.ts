import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ContentServiceModule } from './content-service.module';
import { RabbitMQConfig, QUEUE_NAMES } from '@app/rabbitmq';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RpcDomainErrorFilter } from '@app/error-adapters';

async function bootstrap() {
  const app = await NestFactory.create(ContentServiceModule);
  app.useGlobalFilters(new RpcDomainErrorFilter());

  const configService = app.get(ConfigService);
  app.connectMicroservice<MicroserviceOptions>(
    RabbitMQConfig.createServerConfig(configService, QUEUE_NAMES.CONTENT_QUEUE),
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  await app.init();
  Logger.verbose('Content Service is listening on RabbitMQ...');
}

bootstrap().catch((error) => {
  Logger.error('Failed to start Content Service:', error);
  process.exit(1);
});
