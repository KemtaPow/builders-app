import 'reflect-metadata';
import { PrismaService } from '../../prisma.service.js';
import { OutboxService } from './outbox.service.js';


const prisma = new PrismaService();
const outbox = new OutboxService(prisma);


async function handle(item: any) {
// Demo handlers
if (item.topic === 'xero.invoice.create') {
// TODO: call Xero adapter; here we just log
console.log('[outbox] would create Xero invoice for job', item.payload.jobId);
}
if (item.topic === 'notify.complete') {
console.log('[outbox] would send completion notification', item.payload);
}
}


async function loop() {
await prisma.$connect();
console.log('[worker] started');
for (;;) {
const batch = await outbox.takeBatch(20);
if (!batch.length) { await new Promise(r => setTimeout(r, 1500)); continue; }
for (const it of batch) {
try { await handle(it); await outbox.markSent(it.id); }
catch (e: any) { await outbox.markFailed(it.id, e?.message || String(e)); }
}
}
}
loop().catch(e => { console.error(e); process.exit(1); });