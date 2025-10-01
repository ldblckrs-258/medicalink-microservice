import { DomainError } from '@app/domain-errors';

/**
 * Error thrown when saga orchestration fails
 */
export class SagaOrchestrationError extends DomainError {
  public readonly sagaId: string;
  public readonly step?: string;
  public readonly executedSteps: string[];
  public readonly compensatedSteps: string[];
  public readonly durationMs: number;

  constructor(
    message: string,
    options: {
      code?: string;
      step?: string;
      sagaId: string;
      executedSteps: string[];
      compensatedSteps: string[];
      durationMs: number;
      originalError?: unknown;
    },
  ) {
    super(message, {
      code: options.code || 'SAGA_ORCHESTRATION_FAILED',
      details: options.originalError,
      cause: options.originalError,
    });

    this.sagaId = options.sagaId;
    this.step = options.step;
    this.executedSteps = options.executedSteps;
    this.compensatedSteps = options.compensatedSteps;
    this.durationMs = options.durationMs;
  }
}

/**
 * Error thrown when read composition fails
 */
export class CompositionError extends DomainError {
  public readonly sources: {
    service: string;
    fetched: boolean;
    error?: string;
  }[];

  constructor(
    message: string,
    options: {
      code?: string;
      sources: { service: string; fetched: boolean; error?: string }[];
      details?: unknown;
    },
  ) {
    super(message, {
      code: options.code || 'COMPOSITION_FAILED',
      details: options.details,
    });

    this.sources = options.sources;
  }
}
