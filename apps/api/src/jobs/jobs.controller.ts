import { Body, Controller, Get, Param, Post, Query, UseGuards, BadRequestException, HttpException } from '@nestjs/common';
import { JobsService } from './jobs.service.js';
import { RbacGuard } from '../common/guards/rbac.guard.js';


@Controller('jobs')
@UseGuards(RbacGuard)
export class JobsController {
constructor(private svc: JobsService) {}


@Get()
async list(@Query('orgId') orgId: string) {
const data = await this.svc.list(orgId);
return { items: data, entityType: 'Job' };
}


@Post()
async create(@Body() body: { orgId: string; title: string; budgetCents?: number }) {
const job = await this.svc.create(body.orgId, body.title, body.budgetCents ?? 0);
return { ...job, entityType: 'Job' };
}


@Post(':id/transition')
async transition(
@Param('id') id: string,
@Body() body: { orgId: string; userId?: string; event: string; idempotencyKey?: string }
) {
try {
  const job = await this.svc.transition(body.orgId, body.userId, id, body.event, body.idempotencyKey);
  return { ...job, entityType: 'Job' };
} catch (e: any) {
  if (e instanceof HttpException) throw e;
  throw new BadRequestException(e?.message || 'Transition failed');
}
}
}
