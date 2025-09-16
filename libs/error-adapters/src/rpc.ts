/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { RpcException } from '@nestjs/microservices';
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
  // optional: correlationId?: string;
};

export function toRpcException(e: unknown): RpcException {
  if (e instanceof RpcException) return e;

  if (e instanceof ValidationError) {
    return new RpcException(
      payload(400, 'Bad Request', e.message, e.code, e.details),
    );
  }
  if (e instanceof UnauthorizedError) {
    return new RpcException(payload(401, 'Unauthorized', e.message, e.code));
  }
  if (e instanceof ForbiddenError) {
    return new RpcException(payload(403, 'Forbidden', e.message, e.code));
  }
  if (e instanceof NotFoundError) {
    return new RpcException(payload(404, 'Not Found', e.message, e.code));
  }
  if (e instanceof ConflictError) {
    return new RpcException(
      payload(409, 'Conflict', e.message, e.code, e.details),
    );
  }
  if (e instanceof InfraUnavailableError) {
    return new RpcException(
      payload(503, 'Service Unavailable', e.message, e.code, e.details),
    );
  }
  if (e instanceof DomainError) {
    return new RpcException(
      payload(400, 'Bad Request', e.message, e.code, e.details),
    );
  }

  // Handle Prisma errors specifically
  if (isPrismaError(e)) {
    return new RpcException(
      payload(400, 'Bad Request', extractPrismaMessage(e), 'PRISMA_ERROR'),
    );
  }

  const msg = e instanceof Error ? e.message : 'Internal server error';
  const code = (e as any)?.code ?? 'UNEXPECTED';
  const details = (e as any)?.details;
  return new RpcException(
    payload(500, 'Internal Server Error', msg, code, details),
  );
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
