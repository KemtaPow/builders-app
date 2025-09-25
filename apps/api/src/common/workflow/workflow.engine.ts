import { WorkflowDef, GuardCtx, EffectCtx } from './workflow.types.js';


export type GuardRegistry = Record<string, (ctx: GuardCtx) => Promise<boolean> | boolean>;
export type EffectRegistry = Record<string, (ctx: EffectCtx) => Promise<void> | void>;


export class WorkflowEngine {
constructor(
private def: WorkflowDef,
private guards: GuardRegistry = {},
private effects: EffectRegistry = {}
) {}


can(event: string, from: string) {
const t = this.def.transitions[event];
return !!t && t.from.includes(from);
}


async transition(event: string, from: string, ctx: GuardCtx): Promise<{ to: string }>{
const t = this.def.transitions[event];
if (!t) throw new Error(`Unknown event ${event}`);
if (!t.from.includes(from)) throw new Error(`Invalid transition from ${from} via ${event}`);


if (t.guards?.length) {
for (const g of t.guards) {
const ok = await this.guards[g]?.(ctx);
if (!ok) throw new Error(`Guard failed: ${g}`);
}
}


const to = t.to;
if (t.effects?.length) {
for (const e of t.effects) {
await this.effects[e]?.({ ...(ctx as any), from, to, event });
}
}
return { to };
}
}