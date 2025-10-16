import { Module } from '@nestjs/common';
import { DoctorEventHandler } from './doctor-event.handler';
import { AccountEventHandler } from './account-event.handler';
import { AssetsEventHandler } from './assets-event.handler';
import { DoctorCompositeModule } from '../read-composition';
import { CacheModule } from '../cache';
import { ClientsModule } from '../clients';

/**
 * Module for handling events and cache invalidation
 */
@Module({
  imports: [DoctorCompositeModule, CacheModule, ClientsModule],
  controllers: [DoctorEventHandler, AccountEventHandler, AssetsEventHandler],
})
export class EventHandlersModule {}
