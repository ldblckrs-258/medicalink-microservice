import { Module } from '@nestjs/common';
import { DoctorEventHandler } from './doctor-event.handler';
import { AccountEventHandler } from './account-event.handler';
import { DoctorCompositeModule } from '../read-composition';

/**
 * Module for handling events and cache invalidation
 */
@Module({
  imports: [DoctorCompositeModule],
  controllers: [DoctorEventHandler, AccountEventHandler],
})
export class EventHandlersModule {}
