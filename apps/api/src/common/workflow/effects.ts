import { EffectRegistry } from './workflow.engine.js';
import { EventBus } from '../events/event-bus.js';
import { OutboxService } from '../outbox/outbox.service.js';


// These factories bind infrastructure services
export function makeEffects(bus: EventBus, outbox: OutboxService): EffectRegistry {
return {
emitScheduled: ({ orgId, entity }) =>
bus.emit(orgId, 'job.scheduled', { jobId: entity.id }),


notifyComplete: ({ orgId, entity }) =>
bus.emit(orgId, 'job.completed', { jobId: entity.id }),


enqueueXeroInvoice: async ({ orgId, entity }) => {
await outbox.enqueue(orgId, 'xero.invoice.create', { jobId: entity.id });
},
};
}