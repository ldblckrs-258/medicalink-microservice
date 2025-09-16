import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ProviderDirectoryServiceModule } from './provider-directory-service.module';
import * as dotenv from 'dotenv';
import { RpcDomainErrorFilter } from '@app/error-adapters';
import { ExceptionFilter } from '@nestjs/common';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ProviderDirectoryServiceModule,
    {
      transport: Transport.REDIS,
      options: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME,
        db: parseInt(process.env.REDIS_DB || '0'),
        tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
        retryStrategy: (times) => Math.min(times * 200, 2000),
        maxRetriesPerRequest: 3,
        connectTimeout: 10000,
        lazyConnect: true,
      },
    },
  );

  app.useGlobalFilters(new RpcDomainErrorFilter() as ExceptionFilter);
  await app.listen();
}

bootstrap().catch((error) => {
  console.error('Failed to start Provider Directory Service:', error);
  process.exit(1);
});
