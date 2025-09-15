/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RpcException } from '@nestjs/microservices';
import { randomUUID } from 'node:crypto';

export interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  details?: any[];
  code?: string | number;
  requestId?: string;
}

type Normalized = {
  status: number;
  message: string;
  details?: any[];
  code?: string | number;
};

// ---- Lightweight shapes & guards (no deps) ----
interface AxiosLikeError {
  isAxiosError: true;
  message?: string;
  code?: string | number;
  response?: { status?: number; data?: unknown };
}
function isAxiosLike(e: unknown): e is AxiosLikeError {
  return !!(
    e &&
    typeof e === 'object' &&
    'isAxiosError' in e &&
    (e as any).isAxiosError === true
  );
}

interface ZodErrorLite {
  name: 'ZodError';
  flatten: () => { fieldErrors: Record<string, string[]> };
}
function isZodError(e: unknown): e is ZodErrorLite {
  return !!(
    e &&
    typeof e === 'object' &&
    (e as any).name === 'ZodError' &&
    typeof (e as any).flatten === 'function'
  );
}

interface PrismaKnownErrorLite {
  code: string; // e.g. P2002
  meta?: { cause?: string };
  message: string;
}
function isPrismaKnownError(e: unknown): e is PrismaKnownErrorLite {
  return !!(
    e &&
    typeof e === 'object' &&
    typeof (e as any).code === 'string' &&
    /^P\d{4}$/.test((e as any).code)
  );
}
function isError(e: unknown): e is Error {
  return !!(e && typeof e === 'object' && 'name' in e && 'message' in e);
}
function isSyntaxJsonError(e: unknown): e is SyntaxError {
  return (
    e instanceof SyntaxError &&
    typeof e.message === 'string' &&
    /Unexpected token|JSON/.test(e.message)
  );
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly isProd = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() !== 'http') {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const requestId =
      (req.headers['x-request-id'] as string | undefined) ?? randomUUID();

    const n = this.normalize(exception);

    const payload: ErrorResponse = {
      success: false,
      message: n.message,
      statusCode: n.status,
      timestamp: new Date().toISOString(),
      path: (req as any).originalUrl ?? req.url,
      method: req.method,
      ...(n.details && { details: n.details }),
      ...(n.code !== undefined && { code: n.code }),
      requestId,
    };

    res.setHeader('X-Request-Id', requestId);

    const stack = isError(exception) ? exception.stack : undefined;
    const logMsg = `[${requestId}] ${req.method} ${req.url} -> ${n.status} ${this.statusText(n.status)} | ${n.message}`;
    this.logger.error(logMsg, this.isProd ? undefined : stack);

    res.status(n.status).json(payload);
  }

  // -------- helpers --------

  private normalize(exception: unknown): Normalized {
    // Check if it's a serialized RpcException (from microservice)
    if (this.isSerializedRpcException(exception)) {
      const obj = exception as any;
      const rpcPayload = obj.error; // Extract the actual RPC payload
      const status = this.pickStatus(
        rpcPayload.statusCode,
        rpcPayload.status,
        rpcPayload.code,
      );
      return {
        status,
        message: rpcPayload.message || 'Microservice error',
        details: rpcPayload.details,
        code: rpcPayload.code,
      };
    }

    // 1) HttpException (ValidationPipe included)
    if (exception instanceof HttpException) {
      const status =
        exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;
      const resp = exception.getResponse?.();
      if (resp && typeof resp === 'object') {
        const anyResp = resp as Record<string, unknown>;
        const rawMsg =
          anyResp.message ?? exception.message ?? this.statusText(status);
        const details = Array.isArray(anyResp.message)
          ? anyResp.message
          : (anyResp.details as any[] | undefined);
        const code = anyResp.code as string | number | undefined;
        return {
          status,
          message: this.compactMessage(rawMsg),
          details,
          code,
        };
      }
      return {
        status,
        message: this.compactMessage(
          typeof resp === 'string'
            ? resp
            : (exception.message ?? this.statusText(status)),
        ),
      };
    }

    // 2) RpcException
    if (exception instanceof RpcException) {
      const raw = exception.getError();

      if (raw && typeof raw === 'object') {
        const base =
          (raw as any).response && typeof (raw as any).response === 'object'
            ? (raw as any).response
            : (raw as Record<string, unknown>);

        // Handle Prisma errors wrapped in RpcException
        if (this.isPrismaError(base)) {
          return this.handlePrismaError(base);
        }

        const status = this.pickStatus(base.statusCode, base.status, base.code);

        const message =
          this.extractCleanMessage(base.message) ?? 'Microservice error';
        const details =
          (base.details as any[] | undefined) ??
          (Array.isArray(base.message) ? (base.message as any[]) : undefined);
        const code = base.code as string | number | undefined;
        return { status, message, details, code };
      }
      const msg = this.extractCleanMessage(raw) ?? 'RPC Exception';
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: msg,
      };
    }

    // 3) Axios-like upstream
    if (isAxiosLike(exception)) {
      const status = this.pickStatus(
        exception.response?.status,
        undefined,
        exception.code,
      );
      const data = exception.response?.data as
        | Record<string, unknown>
        | undefined;
      const message = this.compactMessage(
        (data && (data.message ?? data.error ?? (data as any).title)) ??
          exception.message ??
          'Upstream request failed',
      );
      const details =
        (Array.isArray((data as any)?.errors) && (data as any).errors) ||
        (Array.isArray((data as any)?.message) && (data as any).message) ||
        (data && typeof data === 'object' ? [data] : undefined);
      return {
        status,
        message,
        details: details as any[] | undefined,
        code: exception.code,
      };
    }

    // 4) ZodError
    if (isZodError(exception)) {
      const flat = exception.flatten();
      const fieldErrors = flat.fieldErrors ?? {};
      const details = Object.keys(fieldErrors).map((k) => ({
        field: k,
        errors: fieldErrors[k],
      }));
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        details,
      };
    }

    // 5) Prisma
    if (isPrismaKnownError(exception)) {
      const map: Record<string, number> = {
        P2002: HttpStatus.CONFLICT,
        P2025: HttpStatus.NOT_FOUND,
      };
      const status = map[exception.code] ?? HttpStatus.BAD_REQUEST;
      return {
        status,
        message: this.compactMessage(
          exception.meta?.cause || exception.message || 'Database error',
        ),
        code: exception.code,
      };
    }

    // 6) Malformed JSON
    if (isSyntaxJsonError(exception)) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Malformed JSON in request body',
      };
    }

    // 7) Generic Error
    if (isError(exception)) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.compactMessage(
          exception.message || 'Internal server error',
        ),
      };
    }

    // 8) Plain object with status/message
    if (exception && typeof exception === 'object') {
      const e = exception as Record<string, unknown>;
      const status = this.pickStatus(e.statusCode, e.status, e.code);
      const message = this.compactMessage(e.message ?? this.statusText(status));
      const details =
        (e.details as any[] | undefined) ??
        (Array.isArray(e.message) ? e.message : undefined);
      return {
        status,
        message,
        details,
        code: e.code as string | number | undefined,
      };
    }

    // 9) Fallback
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }

  private pickStatus(
    statusCode?: unknown,
    status?: unknown,
    code?: unknown,
  ): number {
    // Try statusCode first (from microservice responses)
    const fromStatusCode = this.toHttpStatus(statusCode);
    if (fromStatusCode) {
      return fromStatusCode;
    }

    // Then try status
    const fromStatus = this.toHttpStatus(status);
    if (fromStatus) {
      return fromStatus;
    }

    // network-ish errors
    if (
      typeof code === 'string' &&
      (code === 'ECONNREFUSED' || code === 'ETIMEDOUT')
    ) {
      return HttpStatus.SERVICE_UNAVAILABLE;
    }

    // Default to 500 for RPC errors (not 502)
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private toHttpStatus(v: unknown): number | undefined {
    if (typeof v === 'number' && Number.isInteger(v) && v >= 100 && v <= 599) {
      return v;
    }
    return undefined;
  }

  private statusText(status: number): string {
    switch (status) {
      case 400:
        return 'Bad Request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not Found';
      case 409:
        return 'Conflict';
      case 422:
        return 'Unprocessable Entity';
      case 429:
        return 'Too Many Requests';
      case 502:
        return 'Bad Gateway';
      case 503:
        return 'Service Unavailable';
      case 504:
        return 'Gateway Timeout';
      case 500:
      default:
        return 'Internal Server Error';
    }
  }

  private compactMessage(msg: unknown): string {
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg))
      return msg.map((m) => this.compactMessage(m)).join('; ');
    // primitives
    if (
      typeof msg === 'number' ||
      typeof msg === 'boolean' ||
      typeof msg === 'bigint' ||
      typeof msg === 'symbol'
    ) {
      return String(msg);
    }
    // objects / functions -> safe JSON
    if (msg && typeof msg === 'object') {
      try {
        return JSON.stringify(msg);
      } catch {
        return '[unserializable object]';
      }
    }
    return '';
  }

  private isPrismaError(error: any): boolean {
    if (!error || typeof error !== 'object') return false;

    // Check if it's a Prisma error based on common patterns
    const message = error.message || '';
    return (
      typeof message === 'string' &&
      (message.includes('Invalid `') ||
        message.includes('Prisma') ||
        message.includes('invocation') ||
        (typeof error.code === 'string' && /^P\d{4}$/.test(error.code)))
    );
  }

  private handlePrismaError(error: any): Normalized {
    const message = error.message || 'Database error';

    // Extract clean error message from Prisma error
    let cleanMessage = 'Database error';

    if (typeof message === 'string') {
      // Extract the core error from Prisma's verbose message
      const argumentMatch = message.match(/Argument `(\w+)`: (.+?)(?:\n|$)/);
      if (argumentMatch) {
        cleanMessage = `Invalid ${argumentMatch[1]}: ${argumentMatch[2]}`;
      } else if (message.includes('Invalid')) {
        // Extract just the "Invalid ..." part
        const invalidMatch = message.match(/Invalid[^.]+/);
        cleanMessage = invalidMatch
          ? invalidMatch[0]
          : 'Invalid database operation';
      } else {
        cleanMessage = message.split('\n')[0] || 'Database error';
      }
    }

    return {
      status: HttpStatus.BAD_REQUEST,
      message: cleanMessage,
      code: error.code,
    };
  }

  private extractCleanMessage(msg: unknown): string | null {
    if (typeof msg === 'string') {
      // If it's a very long message, truncate it
      if (msg.length > 200) {
        return msg.substring(0, 200) + '...';
      }
      return msg;
    }

    if (Array.isArray(msg)) {
      return msg
        .map((m) => this.extractCleanMessage(m))
        .filter(Boolean)
        .join('; ');
    }

    if (msg && typeof msg === 'object') {
      // Try to extract a meaningful message from the object
      const obj = msg as any;
      if (obj.message && typeof obj.message === 'string') {
        return this.extractCleanMessage(obj.message);
      }
      if (obj.error && typeof obj.error === 'string') {
        return obj.error;
      }
      // Avoid stringifying large objects
      return '[Complex error object]';
    }

    return null;
  }

  private isSerializedRpcException(exception: unknown): boolean {
    if (!exception || typeof exception !== 'object') {
      return false;
    }

    const obj = exception as any;
    // Check if it has the structure: { error: { statusCode, message, ... }, message }
    return (
      obj.error &&
      typeof obj.error === 'object' &&
      typeof obj.error.statusCode === 'number' &&
      typeof obj.error.message === 'string' &&
      obj.error.statusCode >= 100 &&
      obj.error.statusCode <= 599
    );
  }
}
