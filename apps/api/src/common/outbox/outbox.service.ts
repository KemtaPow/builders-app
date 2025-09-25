import crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service.js';


@Injectable()
export class OutboxService {
constructor(private prisma: PrismaService) {}


async withIdempotency<T>(orgId: string, userId: string | undefined, key: string, request: any, fn: () => Promise<T>): Promise<T> {
const requestHash = crypto.createHash('sha256').update(JSON.stringify(request)).digest('hex');
const existing = await this.prisma.idempotencyKey.findUnique({ where: { key } });
if (existing) return (existing.response as any) as T;


const result = await fn();
await this.prisma.idempotencyKey.create({ data: { key, orgId, userId, requestHash, response: result as any } });
return result;
}


async enqueue(orgId: string, topic: string, payload: any) {
await this.prisma.integrationOutbox.create({ data: { orgId, topic, payload } });
}


async takeBatch(limit = 20) {
// Simple polling worker pattern
const items = await this.prisma.integrationOutbox.findMany({ where: { status: 'PENDING' }, take: limit, orderBy: { createdAt: 'asc' } });
return items;
}


async markSent(id: string) {
await this.prisma.integrationOutbox.update({ where: { id }, data: { status: 'SENT', attempts: { increment: 1 } } });
}


async markFailed(id: string, err: string) {
await this.prisma.integrationOutbox.update({ where: { id }, data: { status: 'FAILED', attempts: { increment: 1 }, lastError: err } });
}
}