import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ProviderDirectoryServiceModule } from './provider-directory-service.module';
import * as dotenv from 'dotenv';
import { RpcDomainErrorFilter } from '@app/error-adapters';
import { Logger } from '@nestjs/common';
import { RabbitMQConfig, QUEUE_NAMES } from '@app/rabbitmq';
import { ConfigService } from '@nestjs/config';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(ProviderDirectoryServiceModule);
  app.useGlobalFilters(new RpcDomainErrorFilter());

  const configService = app.get(ConfigService);
  app.connectMicroservice<MicroserviceOptions>(
    RabbitMQConfig.createServerConfig(
      configService,
      QUEUE_NAMES.PROVIDER_QUEUE,
    ),
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  await app.init();
  Logger.verbose('Provider Directory Service is listening on RabbitMQ...');
}

bootstrap().catch((error) => {
  Logger.error('Failed to start Provider Directory Service:', error);
  process.exit(1);
});
