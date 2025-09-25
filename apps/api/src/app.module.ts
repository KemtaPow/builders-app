import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { AuditService } from './common/audit/audit.service.js';
import { AuditInterceptor } from './common/audit/audit.interceptor.js';
import { EventBus } from './common/events/event-bus.js';
import { OutboxService } from './common/outbox/outbox.service.js';
import { JobsModule } from './jobs/jobs.module.js';


@Module({
providers: [PrismaService, AuditService, AuditInterceptor, EventBus, OutboxService],
imports: [JobsModule],
})
export class AppModule {}