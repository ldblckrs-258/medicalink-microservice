import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { AccountsServiceModule } from './accounts-service.module';
import * as dotenv from 'dotenv';
import { RpcDomainErrorFilter } from '@app/error-adapters';
import { Logger } from '@nestjs/common';
import { RabbitMQConfig, QUEUE_NAMES } from '@app/rabbitmq';
import { ConfigService } from '@nestjs/config';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AccountsServiceModule);
  app.useGlobalFilters(new RpcDomainErrorFilter());

  const configService = app.get(ConfigService);
  app.connectMicroservice<MicroserviceOptions>(
    RabbitMQConfig.createServerConfig(
      configService,
      QUEUE_NAMES.ACCOUNTS_QUEUE,
    ),
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  await app.init();

  Logger.verbose('Accounts Service is listening on RabbitMQ...');
}

bootstrap().catch((error) => {
  Logger.error('Failed to start Accounts Service:', error);
  process.exit(1);
});
