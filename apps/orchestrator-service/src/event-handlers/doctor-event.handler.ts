import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { DoctorCompositeService } from '../read-composition';
import { ORCHESTRATOR_EVENTS } from '../common/constants';

/**
 * Event handler for doctor profile events
 * Automatically invalidates cache when doctor data changes
 */
@Controller()
export class DoctorEventHandler {
  private readonly logger = new Logger(DoctorEventHandler.name);

  constructor(
    private readonly doctorCompositeService: DoctorCompositeService,
  ) {}

  /**
   * Handle doctor profile created event
   */
  @EventPattern(ORCHESTRATOR_EVENTS.DOCTOR_PROFILE_CREATED)
  async handleDoctorProfileCreated(
    @Payload() data: { staffAccountId: string; profileId: string },
  ) {
    this.logger.log(
      `Doctor profile created event received for staffAccountId: ${data.staffAccountId}`,
    );

    try {
      // Invalidate doctor composite cache
      await this.doctorCompositeService.invalidateDoctorCache(
        data.staffAccountId,
      );

      // Invalidate all list caches as new doctor was added
      await this.doctorCompositeService.invalidateDoctorListCache();

      this.logger.debug(
        `Cache invalidated for new doctor: ${data.staffAccountId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for doctor created event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle doctor profile updated event
   */
  @EventPattern(ORCHESTRATOR_EVENTS.DOCTOR_PROFILE_UPDATED)
  async handleDoctorProfileUpdated(
    @Payload()
    data: {
      staffAccountId: string;
      profileId: string;
      fields?: string[];
    },
  ) {
    this.logger.log(
      `Doctor profile updated event received for staffAccountId: ${data.staffAccountId}`,
    );

    try {
      // Invalidate specific doctor cache
      await this.doctorCompositeService.invalidateDoctorCache(
        data.staffAccountId,
      );

      // If fields that affect search results were updated, invalidate list caches
      const searchAffectingFields = [
        'isActive',
        'specialties',
        'workLocations',
      ];
      const shouldInvalidateLists =
        !data.fields ||
        data.fields.some((field) => searchAffectingFields.includes(field));

      if (shouldInvalidateLists) {
        await this.doctorCompositeService.invalidateDoctorListCache();
        this.logger.debug(
          'List caches invalidated due to search-affecting fields update',
        );
      }

      this.logger.debug(`Cache invalidated for doctor: ${data.staffAccountId}`);
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for doctor updated event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle doctor profile deleted event
   */
  @EventPattern(ORCHESTRATOR_EVENTS.DOCTOR_PROFILE_DELETED)
  async handleDoctorProfileDeleted(
    @Payload() data: { staffAccountId: string; profileId: string },
  ) {
    this.logger.log(
      `Doctor profile deleted event received for staffAccountId: ${data.staffAccountId}`,
    );

    try {
      // Invalidate doctor composite cache
      await this.doctorCompositeService.invalidateDoctorCache(
        data.staffAccountId,
      );

      // Invalidate all list caches as doctor was removed
      await this.doctorCompositeService.invalidateDoctorListCache();

      this.logger.debug(
        `Cache invalidated for deleted doctor: ${data.staffAccountId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for doctor deleted event: ${error.message}`,
        error.stack,
      );
    }
  }
}
