import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller.js';
import { JobsService } from './jobs.service.js';
import { PrismaService } from '../..//prisma.service.js';
import { EventBus } from '../common/events/event-bus.js';
import { OutboxService } from '../common/outbox/outbox.service.js';
import { RbacGuard } from '../common/guards/rbac.guard.js';


@Module({
controllers: [JobsController],
providers: [JobsService, PrismaService, EventBus, OutboxService, RbacGuard],
})
export class JobsModule {}