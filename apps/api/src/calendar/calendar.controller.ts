import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CalendarService } from './calendar.service.js';
import { RbacGuard } from '../common/guards/rbac.guard.js';

@Controller('calendar')
@UseGuards(RbacGuard)
export class CalendarController {
  constructor(private svc: CalendarService) {}

  @Get('events')
  async list(
    @Query('orgId') orgId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const items = await this.svc.list(orgId, from, to);
    return { items, entityType: 'CalendarEvent' };
  }

  @Post('events')
  async create(
    @Body() body: { orgId: string; title: string; jobId?: string; start: string; end: string; color?: string; allDay?: boolean },
  ) {
    const item = await this.svc.create(body);
    return { ...item, entityType: 'CalendarEvent' };
  }

  @Patch('events/:id/times')
  async move(
    @Param('id') id: string,
    @Body() body: { orgId: string; start: string; end: string },
  ) {
    const item = await this.svc.moveTimes(id, body.orgId, body.start, body.end);
    return { ...item, entityType: 'CalendarEvent' };
  }

  @Post('events/:id/status')
  async setStatus(
    @Param('id') id: string,
    @Body() body: { orgId: string; status: 'SCHEDULED'|'IN_PROGRESS'|'COMPLETE'|'INVOICED'|'CANCELLED'|'DRAFT' },
  ) {
    const item = await this.svc.setStatus(id, body.orgId, body.status as any);
    return { ...item, entityType: 'CalendarEvent' };
  }

  @Post('events/:id/flag')
  async flag(
    @Param('id') id: string,
    @Body() body: { flag?: string },
  ) {
    const item = await this.svc.flag(id, body.flag);
    return { ...item, entityType: 'CalendarEvent' };
  }
}

