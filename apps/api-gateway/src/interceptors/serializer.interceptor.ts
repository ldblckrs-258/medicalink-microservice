import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { instanceToPlain } from 'class-transformer';
import deepResolvePromises from '../utils/deep-resolver';

export interface SerializedResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: any;
  timestamp: string;
  path: string;
  method: string;
  statusCode?: number;
}

@Injectable()
export class ResolvePromisesInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResolvePromisesInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url } = request;
    return next.handle().pipe(
      // Resolve any nested promises first
      mergeMap((data) => deepResolvePromises(data)),

      // Transform and serialize the response
      map((data) => {
        const serializedData = this.serializeData(data);

        // Check if data has paginated structure (data + meta)
        const isPaginatedResponse =
          serializedData &&
          typeof serializedData === 'object' &&
          'data' in serializedData &&
          'meta' in serializedData &&
          Array.isArray(serializedData.data);

        // Create standardized response format
        const standardResponse: SerializedResponse = {
          success: true,
          message: this.getSuccessMessage(
            String(method),
            Number(response.statusCode),
          ),
          data: isPaginatedResponse ? serializedData.data : serializedData,
          timestamp: new Date().toISOString(),
          path: url,
          method: method,
          statusCode: response.statusCode,
        };

        // Add meta if it's a paginated response
        if (isPaginatedResponse) {
          standardResponse.meta = serializedData.meta;
        }

        return standardResponse;
      }),
    );
  }

  /**
   * Serialize data using class-transformer to ensure proper transformation
   */
  private serializeData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.serializeData(item));
    }

    // Handle objects with class-transformer
    if (typeof data === 'object') {
      try {
        // Try to use instanceToPlain for class instances
        if (data.constructor && data.constructor !== Object) {
          return instanceToPlain(data, {
            excludeExtraneousValues: false,
            enableImplicitConversion: true,
            exposeDefaultValues: true,
          });
        }

        // For plain objects, serialize each property
        const serialized: any = {};
        for (const [key, value] of Object.entries(
          data as Record<string, any>,
        )) {
          serialized[key] = this.serializeData(value);
        }
        return serialized;
      } catch (error) {
        this.logger.warn(`Serialization warning for object: ${error.message}`);
        return data;
      }
    }

    // Handle dates - convert to ISO string
    if (data instanceof Date) {
      return data.toISOString();
    }

    // Return primitive values as-is
    return data;
  }

  /**
   * Generate success message based on HTTP method and status code
   */
  private getSuccessMessage(method: string, statusCode?: number): string {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'Data retrieved successfully';
      case 'POST':
        return statusCode === 201
          ? 'Resource created successfully'
          : 'Operation completed successfully';
      case 'PUT':
      case 'PATCH':
        return 'Resource updated successfully';
      case 'DELETE':
        return 'Resource deleted successfully';
      default:
        return 'Operation completed successfully';
    }
  }
}
