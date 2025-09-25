import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { WorkflowEngine } from '../common/workflow/workflow.engine.js';
import { guards } from '../common/workflow/guards.js';
import { makeEffects } from '../common/workflow/effects.js';
import jobDef from '../common/workflow/job.workflow.json' with { type: 'json' };
import { EventBus } from '../common/events/event-bus.js';
import { OutboxService } from '../common/outbox/outbox.service.js';
import type { JobStatus } from '@prisma/client';


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
    // Ensure the org exists (useful for demo orgId values like "demo-org")
    await this.prisma.org.upsert({
      where: { id: orgId },
      update: {},
      create: { id: orgId, name: orgId },
    });
    return this.prisma.job.create({ data: { orgId, title, budgetCents } });
  }


async transition(orgId: string, userId: string | undefined, id: string, event: string, idempotencyKey?: string) {
const runner = async () => {
const job = await this.prisma.job.findFirstOrThrow({ where: { id, orgId } });
let to: string;
try {
  ({ to } = await this.engine.transition(event, job.status, { orgId, userId, entity: job }));
} catch (e: any) {
  throw new BadRequestException(e?.message || 'Invalid transition');
}
const data: any = { status: to as JobStatus };
if (to === 'SCHEDULED' && !job.scheduledAt) {
  data.scheduledAt = new Date();
}
const updated = await this.prisma.job.update({ where: { id }, data });
// Record event row as well
await this.prisma.domainEvent.create({ data: { orgId, name: `job.${event.toLowerCase()}`, entityType: 'Job', entityId: id, payload: { from: job.status, to } } });
return updated;
};


if (!idempotencyKey) return runner();
const outbox = new OutboxService(this.prisma);
return outbox.withIdempotency(orgId, userId, idempotencyKey, { id, event }, runner);
}
}
