import { Module } from '@nestjs/common';
import { DoctorEventHandler } from './doctor-event.handler';
import { AccountEventHandler } from './account-event.handler';
import { AssetsEventHandler } from './assets-event.handler';
import { SpecialtyEventHandler } from './specialty-event.handler';
import { BlogEventHandler } from './blog-event.handler';
import {
  DoctorCompositeModule,
  BlogCompositeModule,
} from '../read-composition';
import { CacheModule } from '../cache';
import { ClientsModule } from '../clients';

/**
 * Module for handling events and cache invalidation
 */
@Module({
  imports: [
    DoctorCompositeModule,
    BlogCompositeModule,
    CacheModule,
    ClientsModule,
  ],
  controllers: [
    DoctorEventHandler,
    AccountEventHandler,
    AssetsEventHandler,
    SpecialtyEventHandler,
    BlogEventHandler,
  ],
})
export class EventHandlersModule {}
