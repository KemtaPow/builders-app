import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { WorkflowEngine } from '../common/workflow/workflow.engine.js';
import { guards } from '../common/workflow/guards.js';
import { makeEffects } from '../common/workflow/effects.js';
import jobDef from '../../workflows/job.workflow.json' assert { type: 'json' };
import { EventBus } from '../common/events/event-bus.js';
import { OutboxService } from '../common/outbox/outbox.service.js';


@Injectable()
export class JobsService {
private engine: WorkflowEngine;
constructor(private prisma: PrismaService, bus: EventBus, outbox: OutboxService) {
this.engine = new WorkflowEngine(jobDef as any, guards, makeEffects(bus, outbox));
}


list(orgId: string) {
return this.prisma.job.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' } });
}


async create(orgId: string, title: string, budgetCents = 0) {
return this.prisma.job.create({ data: { orgId, title, budgetCents } });
}


async transition(orgId: string, userId: string | undefined, id: string, event: string, idempotencyKey?: string) {
const runner = async () => {
const job = await this.prisma.job.findFirstOrThrow({ where: { id, orgId } });
const { to } = await this.engine.transition(event, job.status, { orgId, userId, entity: job });
const updated = await this.prisma.job.update({ where: { id }, data: { status: to } });
// Record event row as well
await this.prisma.domainEvent.create({ data: { orgId, name: `job.${event.toLowerCase()}`, entityType: 'Job', entityId: id, payload: { from: job.status, to } } });
return updated;
};


if (!idempotencyKey) return runner();
const outbox = new OutboxService(this.prisma);
return outbox.withIdempotency(orgId, userId, idempotencyKey, { id, event }, runner);
}
}