import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SagaOrchestratorService, SagaStep } from '../../saga';
import { MicroserviceClientHelper } from '../../clients';
import { SERVICE_PATTERNS } from '../../common/constants';
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
export class DoctorCreationOrchestratorService {
  private readonly logger = new Logger(DoctorCreationOrchestratorService.name);

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
    this.logger.log(
      `Starting doctor creation orchestration for email: ${command.email}`,
    );

    // Define saga steps
    const steps: SagaStep[] = [
      {
        name: 'createAccount',
        execute: async (input) => {
          this.logger.debug('Step 1: Creating staff account with DOCTOR role');
          const account = await this.clientHelper.send<IStaffAccount>(
            this.accountsClient,
            SERVICE_PATTERNS.ACCOUNTS.DOCTOR_CREATE,
            input,
            { timeoutMs: 12000 },
          );
          this.logger.debug(`Account created: ${account.id}`);
          return { ...input, account };
        },
        compensate: async (output) => {
          this.logger.warn(
            `Compensating: Deleting account ${output.account.id}`,
          );
          try {
            await this.clientHelper.send(
              this.accountsClient,
              SERVICE_PATTERNS.ACCOUNTS.DOCTOR_DELETE,
              output.account.id,
              { timeoutMs: 8000 },
            );
            this.logger.debug('Account deleted successfully');
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
          this.logger.debug(
            `Step 2: Creating empty doctor profile for account: ${input.account.id}`,
          );
          const profile = await this.clientHelper.send<{ id: string }>(
            this.providerClient,
            SERVICE_PATTERNS.PROVIDER.PROFILE_CREATE_EMPTY,
            { staffAccountId: input.account.id },
            { timeoutMs: 12000 },
          );
          this.logger.debug(`Profile created: ${profile.id}`);
          return { ...input, profile };
        },
        compensate: async (output) => {
          if (!output.profile) return;

          this.logger.warn(
            `Compensating: Deleting profile ${output.profile.id}`,
          );
          try {
            await this.clientHelper.send(
              this.providerClient,
              SERVICE_PATTERNS.PROVIDER.PROFILE_DELETE,
              output.profile.id,
              { timeoutMs: 8000 },
            );
            this.logger.debug('Profile deleted successfully');
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
      this.logger.error(
        `Doctor creation failed at step: ${result.error?.step}`,
        result.error?.originalError,
      );

      throw new SagaOrchestrationError(
        result.error?.message || 'Doctor creation failed',
        {
          code: result.error?.code,
          step: result.error?.step,
          sagaId: result.metadata.sagaId,
          executedSteps: result.metadata.executedSteps,
          compensatedSteps: result.metadata.compensatedSteps,
          durationMs: result.metadata.durationMs,
          originalError: result.error?.originalError,
        },
      );
    }

    // Return success result
    this.logger.log(
      `Doctor creation completed successfully. Account: ${result.data!.account.id}, Profile: ${result.data!.profile.id}`,
    );

    return {
      account: result.data!.account,
      profileId: result.data!.profile.id,
      metadata: result.metadata,
    };
  }
}
