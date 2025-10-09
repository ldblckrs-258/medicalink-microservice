/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { RpcException } from '@nestjs/microservices';
import { HttpException } from '@nestjs/common';
import { DomainError } from '@app/domain-errors';

export type RpcErrorPayload = {
  statusCode: number;
  message: string;
  error: string;
  details?: unknown;
};

export function toRpcException(e: unknown): RpcException {
  if (e instanceof RpcException) return e;

  let p: RpcErrorPayload;

  // Handle SagaOrchestrationError specifically
  if (isSagaOrchestrationError(e)) {
    const sagaError = e as any;
    const originalError = sagaError.details;

    const statusCode =
      originalError?.statusCode ||
      (originalError?.error?.statusCode ? originalError.error.statusCode : 500);

    const rootMessage =
      originalError?.message ||
      originalError?.error?.message ||
      sagaError.message ||
      'Saga orchestration failed';

    const name =
      originalError?.name ||
      originalError?.error?.name ||
      'Saga Orchestration Failed';

    p = {
      statusCode,
      error: name,
      message: rootMessage,
      details: {
        sagaError: sagaError.message,
        sagaId: sagaError.sagaId,
        step: sagaError.step,
        executedSteps: sagaError.executedSteps,
        compensatedSteps: sagaError.compensatedSteps,
        durationMs: sagaError.durationMs,
        ...(originalError && { originalError }),
      },
    };
  } else if (e instanceof HttpException) {
    // Handle all NestJS HTTP exceptions (including ValidationPipe errors)
    const status = e.getStatus();
    const response = e.getResponse();
    const message =
      typeof response === 'string'
        ? response
        : (response as any)?.message || e.message;
    const details = typeof response === 'object' ? response : undefined;
    p = payload(status, e.name, message, details);
  } else if (isPrismaError(e)) {
    p = payload(400, 'Bad Request', extractPrismaMessage(e), 'PRISMA_ERROR');
  } else if (e instanceof DomainError) {
    // Parse from DomainError instead of mapping each subclass
    const statusCode = e.statusCode ?? 400;
    const name = e.name;
    p = payload(statusCode, name, e.message, e.details);
  } else {
    const msg = e instanceof Error ? e.message : 'Internal server error';
    const details = (e as any)?.details;
    p = payload(500, 'Internal Server Error', msg, details);
  }

  return new RpcException(p);
}

function payload(
  statusCode: number,
  error: string,
  message: string,
  details?: unknown,
): RpcErrorPayload {
  return {
    statusCode,
    error,
    message: safeMessage(message),
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
    // Normalize and try to extract well-known Prisma error messages
    const normalized = message.replace(/\r/g, '');

    const fkMatch = normalized.match(
      /Foreign key constraint violated on the constraint:\s*`([^`]+)`/i,
    );
    if (fkMatch) {
      return `Foreign key constraint violated: ${fkMatch[1]}`;
    }

    // Unique constraint failed (common Prisma engine message)
    const uniqueMatch = normalized.match(
      /Unique constraint failed on the fields?:\s*`?([^`]+)`?/i,
    );
    if (uniqueMatch) {
      return `Unique constraint failed on the field(s): ${uniqueMatch[1]}`;
    }

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
    return message.split('\n')[0] || 'Database error';
  }
  return 'Database error';
}

function isSagaOrchestrationError(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false;
  return (
    (e as any).sagaId !== undefined && (e as any).executedSteps !== undefined
  );
}
