import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class MicroserviceErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MicroserviceErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const request = context.switchToHttp().getRequest();
        const { method, url } = request;

        this.logger.error(
          `Microservice error on ${method} ${url}: ${error.message}`,
          error.stack,
        );

        // Handle specific error types
        if (
          error.name === 'TimeoutError' ||
          error instanceof RequestTimeoutException
        ) {
          this.logger.warn(
            `Request timeout on ${method} ${url} - Service not responding`,
          );
          return throwError(
            () =>
              new RequestTimeoutException(
                'Service is temporarily unavailable. Please try again later.',
              ),
          );
        }

        // Handle connection errors
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          this.logger.error(
            `Connection error on ${method} ${url} - Service unreachable`,
          );
          return throwError(
            () =>
              new ServiceUnavailableException(
                'Service is currently unavailable. Please try again later.',
              ),
          );
        }

        // Handle Redis connection errors
        if (
          error.message?.includes('Redis') ||
          error.message?.includes('REDIS')
        ) {
          this.logger.error(`Redis connection error on ${method} ${url}`);
          return throwError(
            () =>
              new ServiceUnavailableException(
                'Message broker is currently unavailable. Please try again later.',
              ),
          );
        }

        // Pass through other errors
        return throwError(() => error);
      }),
    );
  }
}
