import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { DoctorCompositeService } from '../read-composition';
import { ORCHESTRATOR_EVENTS } from '../common/constants';

/**
 * Event handler for doctor profile events
 * Automatically invalidates cache when doctor profile changes
 */
@Controller()
export class DoctorEventHandler {
  private readonly logger = new Logger(DoctorEventHandler.name);

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
   * Handle doctor profile created event
   */
  @EventPattern(ORCHESTRATOR_EVENTS.DOCTOR_PROFILE_CREATED)
  async handleDoctorProfileCreated(@Payload() payload: unknown) {
    const data = this.unwrapPayload<{
      staffAccountId: string;
      profileId: string;
    }>(payload);

    try {
      await this.doctorCompositeService.invalidateDoctorCache(
        data.staffAccountId,
      );
      await this.doctorCompositeService.invalidateDoctorListCache();
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for doctor profile created event: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Handle doctor profile updated event
   */
  @EventPattern(ORCHESTRATOR_EVENTS.DOCTOR_PROFILE_UPDATED)
  async handleDoctorProfileUpdated(@Payload() payload: unknown) {
    const data = this.unwrapPayload<{
      staffAccountId: string;
      profileId: string;
    }>(payload);

    try {
      await this.doctorCompositeService.invalidateDoctorCache(
        data.staffAccountId,
      );
      await this.doctorCompositeService.invalidateDoctorListCache();
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for doctor profile updated event: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Handle doctor profile deleted event
   */
  @EventPattern(ORCHESTRATOR_EVENTS.DOCTOR_PROFILE_DELETED)
  async handleDoctorProfileDeleted(@Payload() payload: unknown) {
    const data = this.unwrapPayload<{
      staffAccountId: string;
      profileId: string;
    }>(payload);

    try {
      await this.doctorCompositeService.invalidateDoctorCache(
        data.staffAccountId,
      );
      await this.doctorCompositeService.invalidateDoctorListCache();
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for doctor profile deleted event: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
