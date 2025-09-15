import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ApiGatewayModule } from './api-gateway.module';
import { ResolvePromisesInterceptor } from './utils/serializer.interceptor';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  // Enable comprehensive validation pipes with detailed error reporting
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: false,
      validateCustomDecorators: true,
      stopAtFirstError: false,
      skipMissingProperties: false,
      skipNullProperties: false,
      skipUndefinedProperties: false,
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          value: error.value,
          constraints: error.constraints,
        }));
        return new BadRequestException({
          message: 'Validation failed',
          error: 'Bad Request',
          statusCode: 400,
          details: result,
        });
      },
    }),
  );

  app.useGlobalInterceptors(new ResolvePromisesInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  // app.enableCors();
  app.setGlobalPrefix('api');

  const port = process.env.API_GATEWAY_PORT || 3000;
  await app.listen(port);
  console.log(`API Gateway is running on port ${port}`);
}
void bootstrap();
