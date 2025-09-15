import { Injectable, Logger, RequestTimeoutException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, throwError } from 'rxjs';

export interface MicroserviceCallOptions {
  timeoutMs?: number;
}

@Injectable()
export class MicroserviceService {
  private readonly logger = new Logger(MicroserviceService.name);
  private readonly DEFAULT_TIMEOUT = 10000; // 10 seconds

  /**
   * Send with timeout và error handling
   */
  async sendWithTimeout<T>(
    client: ClientProxy,
    pattern: string,
    data: any,
    options: MicroserviceCallOptions = {},
  ): Promise<T> {
    const { timeoutMs = this.DEFAULT_TIMEOUT } = options;
    const serviceName = this.extractServiceName(pattern);

    try {
      const result = await firstValueFrom(
        client.send<T>(pattern, data).pipe(
          timeout(timeoutMs),
          catchError((error) => {
            this.logger.error(
              `Microservice call failed - Pattern: ${pattern}, Service: ${serviceName}, Error: ${error.message}`,
              error.stack,
            );

            if (error.name === 'TimeoutError') {
              throw new RequestTimeoutException(
                `Service ${serviceName} is not responding (timeout after ${timeoutMs}ms)`,
              );
            }

            return throwError(() => error);
          }),
        ),
      );

      this.logger.debug(
        `Microservice call successful - Pattern: ${pattern}, Service: ${serviceName}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to communicate with service ${serviceName}: ${error.message}`,
      );
      throw error;
    }
  }

  async isServiceAvailable(
    client: ClientProxy,
    serviceName: string,
  ): Promise<boolean> {
    try {
      await this.sendWithTimeout(
        client,
        'health.ping',
        {},
        { timeoutMs: 5000 },
      );
      return true;
    } catch (error) {
      this.logger.warn(
        `Service ${serviceName} is not available: ${error.message}`,
      );
      return false;
    }
  }

  /**
   * Extract service name từ pattern để logging
   */
  private extractServiceName(pattern: string): string {
    const parts = pattern.split('.');
    return parts[0] || 'unknown';
  }
}
