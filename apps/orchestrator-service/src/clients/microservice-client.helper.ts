import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';

export interface ServiceCallOptions {
  timeoutMs?: number;
  retries?: number;
  logErrors?: boolean;
}

/**
 * Helper service for making calls to other microservices
 */
@Injectable()
export class MicroserviceClientHelper {
  private readonly logger = new Logger(MicroserviceClientHelper.name);
  private readonly defaultTimeout = 10000; // 10 seconds

  /**
   * Send a message to a microservice and wait for response
   */
  async send<T>(
    client: ClientProxy,
    pattern: string,
    data: any,
    options?: ServiceCallOptions,
  ): Promise<T> {
    const timeoutMs = options?.timeoutMs ?? this.defaultTimeout;
    const logErrors = options?.logErrors ?? true;

    try {
      this.logger.debug(`Sending message: ${pattern}`);

      const result = await firstValueFrom(
        client.send<T>(pattern, data).pipe(
          timeout(timeoutMs),
          catchError((error) => {
            if (logErrors) {
              this.logger.error(
                `Error calling ${pattern}:`,
                error.message || error,
              );
            }
            throw error;
          }),
        ),
      );

      this.logger.debug(`Received response from: ${pattern}`);
      return result;
    } catch (error) {
      if (logErrors) {
        this.logger.error(
          `Failed to call ${pattern} after ${timeoutMs}ms:`,
          error,
        );
      }
      throw error;
    }
  }

  /**
   * Send a message without waiting for response (fire and forget)
   */
  emit(client: ClientProxy, pattern: string, data: any): void {
    try {
      this.logger.debug(`Emitting event: ${pattern}`);
      client.emit(pattern, data);
    } catch (error) {
      this.logger.error(`Failed to emit ${pattern}:`, error);
      throw error;
    }
  }

  /**
   * Call multiple services in parallel
   */
  async parallel<T>(
    calls: Array<{
      client: ClientProxy;
      pattern: string;
      data: any;
      options?: ServiceCallOptions;
    }>,
  ): Promise<T[]> {
    const promises = calls.map((call) =>
      this.send<T>(call.client, call.pattern, call.data, call.options),
    );

    return Promise.all(promises);
  }

  /**
   * Call services in sequence (one after another)
   */
  async sequence<T>(
    calls: Array<{
      client: ClientProxy;
      pattern: string;
      data: any | ((previousResult: any) => any);
      options?: ServiceCallOptions;
    }>,
  ): Promise<T[]> {
    const results: T[] = [];

    for (const call of calls) {
      const data =
        typeof call.data === 'function'
          ? call.data(results[results.length - 1])
          : call.data;

      const result = await this.send<T>(
        call.client,
        call.pattern,
        data,
        call.options,
      );

      results.push(result);
    }

    return results;
  }
}
