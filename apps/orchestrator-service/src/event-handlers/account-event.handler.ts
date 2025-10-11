import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { DoctorCompositeService } from '../read-composition';
import { ORCHESTRATOR_EVENTS } from '../common/constants';

/**
 * Event handler for staff account events
 * Automatically invalidates cache when account data changes
 */
@Controller()
export class AccountEventHandler {
  private readonly logger = new Logger(AccountEventHandler.name);

  constructor(
    private readonly doctorCompositeService: DoctorCompositeService,
  ) {}

  // Helper to unwrap enveloped payloads
  private unwrapPayload<T>(payload: unknown): T {
    if (
      payload &&
      typeof payload === 'object' &&
      'timestamp' in (payload as any) &&
      'data' in (payload as any)
    ) {
      return (payload as any).data as T;
    }
    return payload as T;
  }

  /**
   * Handle staff account created event
   * Only care about DOCTOR role accounts
   */
  @EventPattern(ORCHESTRATOR_EVENTS.STAFF_ACCOUNT_CREATED)
  async handleStaffAccountCreated(@Payload() payload: unknown) {
    const data = this.unwrapPayload<{
      id: string;
      email?: string;
      role: string;
    }>(payload);

    if (data.role !== 'DOCTOR') {
      return;
    }

    try {
      await this.doctorCompositeService.invalidateDoctorListCache();
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for account created event: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Handle staff account updated event
   * Only care about DOCTOR role accounts
   */
  @EventPattern(ORCHESTRATOR_EVENTS.STAFF_ACCOUNT_UPDATED)
  async handleStaffAccountUpdated(@Payload() payload: unknown) {
    const data = this.unwrapPayload<{ id: string; role: string }>(payload);

    if (data.role !== 'DOCTOR') {
      return;
    }

    try {
      await this.doctorCompositeService.invalidateDoctorCache(data.id);
      await this.doctorCompositeService.invalidateDoctorListCache();
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for account updated event: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Handle staff account deleted event
   * Only care about DOCTOR role accounts
   */
  @EventPattern(ORCHESTRATOR_EVENTS.STAFF_ACCOUNT_DELETED)
  async handleStaffAccountDeleted(@Payload() payload: unknown) {
    const data = this.unwrapPayload<{ id: string; role: string }>(payload);

    if (data.role !== 'DOCTOR') {
      return;
    }

    try {
      await this.doctorCompositeService.invalidateDoctorCache(data.id);
      await this.doctorCompositeService.invalidateDoctorListCache();
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for account deleted event: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
