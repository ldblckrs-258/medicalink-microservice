import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ProviderDirectoryServiceModule } from './provider-directory-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ProviderDirectoryServiceModule,
    {
      transport: Transport.REDIS,
      options: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    },
  );

  await app.listen();
  console.log('Provider Directory Service is listening...');
}

bootstrap().catch((error) => {
  console.error('Failed to start Provider Directory Service:', error);
  process.exit(1);
});
