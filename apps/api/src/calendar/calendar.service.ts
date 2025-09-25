import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import type { JobStatus } from '@prisma/client';
import { JobsService } from '../jobs/jobs.service.js';

@Injectable()
export class CalendarService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => JobsService)) private jobs: JobsService,
  ) {}

  list(orgId: string, from?: string, to?: string) {
    const where: any = { orgId };
    if (from && to) {
      where.start = { gte: new Date(from), lte: new Date(to) };
    }
    return this.prisma.calendarEvent.findMany({ where, orderBy: { start: 'asc' } });
  }

  async create(payload: { orgId: string; title: string; jobId?: string; start: string; end: string; color?: string; allDay?: boolean }) {
    const { orgId, title, jobId, start, end, color, allDay } = payload;
    // Ensure org exists (demo convenience)
    await this.prisma.org.upsert({ where: { id: orgId }, update: {}, create: { id: orgId, name: orgId } });
    const ev = await this.prisma.calendarEvent.create({
      data: { orgId, title, jobId, start: new Date(start), end: new Date(end), color, allDay: Boolean(allDay) },
    });
    if (jobId) {
      await this.prisma.job.update({ where: { id: jobId }, data: { scheduledAt: new Date(start) } });
    }
    return ev;
  }

  async moveTimes(id: string, orgId: string, start: string, end: string) {
    const ev = await this.prisma.calendarEvent.update({ where: { id }, data: { start: new Date(start), end: new Date(end) } });
    if (ev.jobId) {
      await this.prisma.job.update({ where: { id: ev.jobId }, data: { scheduledAt: new Date(start) } });
    }
    return ev;
  }

  async setStatus(id: string, orgId: string, status: JobStatus) {
    const ev = await this.prisma.calendarEvent.update({ where: { id }, data: { status } });
    if (ev.jobId) {
      // Mirror to Job workflow
      const map: Record<JobStatus, string> = {
        SCHEDULED: 'SCHEDULE',
        IN_PROGRESS: 'START',
        COMPLETE: 'COMPLETE',
        INVOICED: 'INVOICE',
        CANCELLED: 'CANCEL',
        DRAFT: 'SCHEDULE',
      } as any;
      const eventName = map[status];
      if (eventName) {
        try {
          await this.jobs.transition(orgId, undefined, ev.jobId, eventName, `${ev.jobId}:${eventName}`);
        } catch (e: any) {
          throw new BadRequestException(e?.message || 'Invalid job transition');
        }
      }
    }
    return ev;
  }

  async flag(id: string, flag?: string) {
    return this.prisma.calendarEvent.update({ where: { id }, data: { flag } });
  }
}

