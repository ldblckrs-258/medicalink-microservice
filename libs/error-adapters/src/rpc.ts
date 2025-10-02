/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { RpcException } from '@nestjs/microservices';
import { HttpException } from '@nestjs/common';
import {
  DomainError,
  ValidationError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
  InfraUnavailableError,
} from '@app/domain-errors';

export type RpcErrorPayload = {
  statusCode: number;
  message: string;
  error: string;
  code?: string | number;
  details?: unknown;
};

export function toRpcException(e: unknown): RpcException {
  if (e instanceof RpcException) return e;

  let p: RpcErrorPayload;

  // Handle SagaOrchestrationError specifically
  if (isSagaOrchestrationError(e)) {
    const sagaError = e as any;
    const originalError = sagaError.details;

    // Extract status code from original error if available
    const statusCode =
      originalError?.statusCode ||
      (originalError?.error?.statusCode ? originalError.error.statusCode : 500);

    // Extract root cause message from original error
    const rootMessage =
      originalError?.message ||
      originalError?.error?.message ||
      sagaError.message ||
      'Saga orchestration failed';

    // Extract code: prefer original error code over saga code
    const errorCode =
      originalError?.code ||
      originalError?.error?.code ||
      sagaError.code ||
      'SAGA_ORCHESTRATION_FAILED';

    p = {
      statusCode,
      error: getErrorName(statusCode),
      message: rootMessage, // Root cause message at top level
      code: errorCode, // Original error code
      details: {
        // Saga metadata
        sagaError: sagaError.message, // Saga context message
        sagaId: sagaError.sagaId,
        step: sagaError.step,
        executedSteps: sagaError.executedSteps,
        compensatedSteps: sagaError.compensatedSteps,
        durationMs: sagaError.durationMs,
        // Original error info (if exists)
        ...(originalError && { originalError }),
      },
    };
  } else if (e instanceof ValidationError) {
    p = payload(400, 'Bad Request', e.message, e.code, e.details);
  } else if (e instanceof HttpException) {
    // Handle all NestJS HTTP exceptions (including ValidationPipe errors)
    const status = e.getStatus();
    const response = e.getResponse();
    const message =
      typeof response === 'string'
        ? response
        : (response as any)?.message || e.message;
    const details = typeof response === 'object' ? response : undefined;
    const code =
      status === 400
        ? 'VALIDATION_FAILED'
        : (response as any)?.code || 'HTTP_EXCEPTION';
    p = payload(status, getErrorName(status), message, code, details);
  } else if (e instanceof UnauthorizedError) {
    p = payload(401, 'Unauthorized', e.message, e.code);
  } else if (e instanceof ForbiddenError) {
    p = payload(403, 'Forbidden', e.message, e.code);
  } else if (e instanceof NotFoundError) {
    p = payload(404, 'Not Found', e.message, e.code);
  } else if (e instanceof ConflictError) {
    p = payload(409, 'Conflict', e.message, e.code, e.details);
  } else if (e instanceof InfraUnavailableError) {
    p = payload(503, 'Service Unavailable', e.message, e.code, e.details);
  } else if (e instanceof DomainError) {
    p = payload(400, 'Bad Request', e.message, e.code, e.details);
  } else if (isPrismaError(e)) {
    p = payload(400, 'Bad Request', extractPrismaMessage(e), 'PRISMA_ERROR');
  } else {
    const msg = e instanceof Error ? e.message : 'Internal server error';
    const code = (e as any)?.code ?? 'UNEXPECTED';
    const details = (e as any)?.details;
    p = payload(500, 'Internal Server Error', msg, code, details);
  }

  return new RpcException(p);
}

function payload(
  statusCode: number,
  error: string,
  message: string,
  code?: string | number,
  details?: unknown,
): RpcErrorPayload {
  return {
    statusCode,
    error,
    message: safeMessage(message),
    ...(code !== undefined && { code }),
    ...(details !== undefined && { details: safeDetails(details) }),
  };
}

function safeDetails(x: unknown): unknown {
  try {
    if (x === undefined) return undefined;
    JSON.stringify(x);
    return x;
  } catch {
    return { note: 'details omitted (not serializable)' };
  }
}

function safeMessage(m: unknown): string {
  if (typeof m === 'string') return m;
  try {
    return JSON.stringify(m);
  } catch {
    return 'Error';
  }
}

function isPrismaError(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false;

  const error = e as any;
  const message = error.message || '';

  return (
    typeof message === 'string' &&
    (message.includes('Prisma') ||
      message.includes('invocation') ||
      (typeof error.code === 'string' && /^P\d{4}$/.test(error.code)))
  );
}

function extractPrismaMessage(e: unknown): string {
  if (!e || typeof e !== 'object') return 'Database error';

  const error = e as any;
  const message = error.message || 'Database error';

  if (typeof message === 'string') {
    // Extract the core error from Prisma's verbose message
    const argumentMatch = message.match(/Argument `(\w+)`: (.+?)(?:\n|$)/);
    if (argumentMatch) {
      return `Invalid ${argumentMatch[1]}: ${argumentMatch[2]}`;
    }

    const invalidMatch = message.match(/Invalid[^.]+/);
    if (invalidMatch) {
      return invalidMatch[0];
    }

    const unknownArgMatch = message.match(
      /Unknown argument\s+`(\w+)`\.?\s*(.+?)(?:\n|$)/,
    );
    if (unknownArgMatch) {
      return `Unknown field '${unknownArgMatch[1]}'. ${unknownArgMatch[2]}`;
    }

    // Return just the first line for other Prisma errors
    return message.split('\n')[0] || 'Database error';
  }

  return 'Database error';
}

/**
 * Check if error is SagaOrchestrationError
 */
function isSagaOrchestrationError(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false;
  return (
    (e as any).sagaId !== undefined && (e as any).executedSteps !== undefined
  );
}

/**
 * Get human-readable error name from status code
 */
function getErrorName(statusCode: number): string {
  const errorNames: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    500: 'Internal Server Error',
    503: 'Service Unavailable',
  };
  return errorNames[statusCode] || 'Internal Server Error';
}
