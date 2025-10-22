import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SagaOrchestratorService, SagaStep } from '../../saga';
import { MicroserviceClientHelper } from '../../clients';
import {
  DOCTOR_ACCOUNTS_PATTERNS,
  DOCTOR_PROFILES_PATTERNS,
} from '@app/contracts';
import { CreateDoctorCommandDto, DoctorCreationResultDto } from './dto';
import { IStaffAccount } from '@app/contracts/interfaces';
import { SagaOrchestrationError } from '../../common/errors';

/**
 * Output data from doctor creation saga
 */
interface DoctorCreationSagaOutput {
  account: IStaffAccount;
  profile: { id: string };
}

/**
 * Orchestrates the creation of a doctor account + profile
 * Uses Saga pattern for reliable multi-step orchestration
 */
@Injectable()
export class DoctorOrchestratorService {
  private readonly logger = new Logger(DoctorOrchestratorService.name);

  constructor(
    @Inject('ACCOUNTS_SERVICE')
    private readonly accountsClient: ClientProxy,
    @Inject('PROVIDER_DIRECTORY_SERVICE')
    private readonly providerClient: ClientProxy,
    private readonly sagaOrchestrator: SagaOrchestratorService,
    private readonly clientHelper: MicroserviceClientHelper,
  ) {}

  /**
   * Create a complete doctor (account + profile) with saga orchestration
   */
  async createDoctor(
    command: CreateDoctorCommandDto,
  ): Promise<DoctorCreationResultDto> {
    // Define saga steps
    const steps: SagaStep[] = [
      {
        name: 'createAccount',
        execute: async (input) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { correlationId, userId, idempotencyKey, ...accountData } =
            input;
          const account = await this.clientHelper.send<IStaffAccount>(
            this.accountsClient,
            DOCTOR_ACCOUNTS_PATTERNS.CREATE,
            accountData,
            { timeoutMs: 12000 },
          );
          return { ...input, account };
        },
        compensate: async (output) => {
          try {
            await this.clientHelper.send(
              this.accountsClient,
              DOCTOR_ACCOUNTS_PATTERNS.REMOVE,
              output.account.id,
              { timeoutMs: 8000 },
            );
          } catch (error) {
            this.logger.error(
              'Failed to delete account during compensation',
              error,
            );
          }
        },
      },
      {
        name: 'createProfile',
        execute: async (input) => {
          const profile = await this.clientHelper.send<{ id: string }>(
            this.providerClient,
            DOCTOR_PROFILES_PATTERNS.CREATE_EMPTY,
            { staffAccountId: input.account.id },
            { timeoutMs: 12000 },
          );
          return { ...input, profile };
        },
        compensate: async (output) => {
          if (!output.profile) return;

          try {
            await this.clientHelper.send(
              this.providerClient,
              DOCTOR_ACCOUNTS_PATTERNS.REMOVE,
              output.profile.id,
              { timeoutMs: 8000 },
            );
          } catch (error) {
            this.logger.error(
              'Failed to delete profile during compensation',
              error,
            );
          }
        },
      },
    ];

    // Execute saga
    const result = await this.sagaOrchestrator.execute<
      CreateDoctorCommandDto,
      DoctorCreationSagaOutput
    >(steps, command, {
      correlationId: command.correlationId,
      userId: command.userId,
    });

    // If saga failed, throw SagaOrchestrationError
    if (!result.success) {
      throw new SagaOrchestrationError(
        result.error?.message || 'Doctor creation failed',
        {
          step: result.error?.step,
          sagaId: result.metadata.sagaId,
          executedSteps: result.metadata.executedSteps,
          compensatedSteps: result.metadata.compensatedSteps,
          durationMs: result.metadata.durationMs,
          originalError: result.error?.originalError,
        },
      );
    }

    return {
      account: result.data!.account,
      profileId: result.data!.profile.id,
      metadata: result.metadata,
    };
  }
}
