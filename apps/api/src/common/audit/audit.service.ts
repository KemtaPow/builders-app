import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service.js';


@Injectable()
export class AuditService {
constructor(private prisma: PrismaService) {}
async log(params: { orgId: string; userId?: string; action: string; entityType: string; entityId: string; diff?: any }) {
await this.prisma.auditLog.create({
data: { ...params, occurredAt: new Date() },
});
}
}