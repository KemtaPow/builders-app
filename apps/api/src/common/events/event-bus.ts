import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service.js';


@Injectable()
export class EventBus {
constructor(private prisma: PrismaService) {}
async emit(orgId: string, name: string, payload: any, entity?: { type: string; id: string }) {
await this.prisma.domainEvent.create({
data: {
orgId,
name,
payload,
entityType: entity?.type ?? 'generic',
entityId: entity?.id ?? 'n/a',
},
});
}
}