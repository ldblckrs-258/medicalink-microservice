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

  /**
   * Handle staff account created event
   * Only care about DOCTOR role accounts
   */
  @EventPattern(ORCHESTRATOR_EVENTS.STAFF_ACCOUNT_CREATED)
  async handleStaffAccountCreated(
    @Payload() data: { id: string; email: string; role: string },
  ) {
    // Only handle doctor accounts
    if (data.role !== 'DOCTOR') {
      return;
    }

    this.logger.log(
      `Doctor account created event received for account: ${data.id}`,
    );

    try {
      // Invalidate list caches as new doctor account was created
      await this.doctorCompositeService.invalidateDoctorListCache();

      this.logger.debug(
        `List caches invalidated for new doctor account: ${data.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for account created event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle staff account updated event
   * Only care about DOCTOR role accounts
   */
  @EventPattern(ORCHESTRATOR_EVENTS.STAFF_ACCOUNT_UPDATED)
  async handleStaffAccountUpdated(
    @Payload()
    data: {
      id: string;
      role: string;
      fields?: string[];
    },
  ) {
    // Only handle doctor accounts
    if (data.role !== 'DOCTOR') {
      return;
    }

    this.logger.log(
      `Doctor account updated event received for account: ${data.id}`,
    );

    try {
      // Invalidate specific doctor cache
      await this.doctorCompositeService.invalidateDoctorCache(data.id);

      // If personal info changed (name, email), invalidate list caches
      const listAffectingFields = ['fullName', 'email', 'phone', 'isMale'];
      const shouldInvalidateLists =
        !data.fields ||
        data.fields.some((field) => listAffectingFields.includes(field));

      if (shouldInvalidateLists) {
        await this.doctorCompositeService.invalidateDoctorListCache();
        this.logger.debug(
          'List caches invalidated due to personal info update',
        );
      }

      this.logger.debug(`Cache invalidated for doctor account: ${data.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for account updated event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle staff account deleted event
   * Only care about DOCTOR role accounts
   */
  @EventPattern(ORCHESTRATOR_EVENTS.STAFF_ACCOUNT_DELETED)
  async handleStaffAccountDeleted(
    @Payload() data: { id: string; role: string },
  ) {
    // Only handle doctor accounts
    if (data.role !== 'DOCTOR') {
      return;
    }

    this.logger.log(
      `Doctor account deleted event received for account: ${data.id}`,
    );

    try {
      // Invalidate doctor composite cache
      await this.doctorCompositeService.invalidateDoctorCache(data.id);

      // Invalidate all list caches as doctor was removed
      await this.doctorCompositeService.invalidateDoctorListCache();

      this.logger.debug(
        `Cache invalidated for deleted doctor account: ${data.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for account deleted event: ${error.message}`,
        error.stack,
      );
    }
  }
}
