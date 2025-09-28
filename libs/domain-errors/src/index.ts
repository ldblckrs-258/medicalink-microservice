export * from './codes';
export * from './serialization';

export type ErrorDetails = unknown;

export class DomainError extends Error {
  public readonly code?: string;
  public readonly details?: ErrorDetails;

  constructor(
    message: string,
    opts?: { code?: string; details?: ErrorDetails; cause?: unknown },
  ) {
    super(message);
    this.name = new.target.name;
    this.code = opts?.code;
    this.details = opts?.details;
    if (opts?.cause) (this as any).cause = opts.cause;
    Error.captureStackTrace?.(this, new.target);
  }
}

export class ValidationError extends DomainError {
  constructor(details: string[] | any, code = 'VALIDATION_FAILED') {
    super('Validation failed', { code, details });
  }
}
export class NotFoundError extends DomainError {}
export class ConflictError extends DomainError {}
export class ForbiddenError extends DomainError {}
export class UnauthorizedError extends DomainError {}
export class InfraUnavailableError extends DomainError {}

export function isDomainError(e: unknown): e is DomainError {
  return !!(e && typeof e === 'object' && 'name' in e && e instanceof Error);
}

export function fromUnknown(
  err: unknown,
  fallbackMsg = 'Internal error',
): DomainError {
  if (isDomainError(err)) return err;
  if (err instanceof Error) return new DomainError(err.message, { cause: err });
  return new DomainError(fallbackMsg, { details: err });
}

export type PlainDomainError = {
  name: string;
  message: string;
  code?: string;
  details?: ErrorDetails;
};

export function toPlain(e: DomainError): PlainDomainError {
  return {
    name: e.name,
    message: e.message,
    ...(e.code && { code: e.code }),
    ...(e.details !== undefined && { details: e.details }),
  };
}
