import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQService } from './rabbitmq.service';
import { RabbitMQHealthController } from './rabbitmq.health';

@Global()
@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_CLIENT',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const url = configService.getOrThrow<string>('RABBITMQ_URL', {
            infer: true,
          });
          return {
            transport: Transport.RMQ as any,
            options: {
              urls: [url],
              queue: 'medicalink_queue',
              queueOptions: {
                durable: true,
              },
              socketOptions: {
                heartbeatIntervalInSeconds: 60,
                reconnectTimeInSeconds: 5,
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [RabbitMQHealthController],
  providers: [RabbitMQService],
  exports: [RabbitMQService, ClientsModule],
})
export class RabbitMQModule {}
