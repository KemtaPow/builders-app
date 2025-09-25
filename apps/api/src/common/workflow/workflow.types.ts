export type GuardCtx = { orgId: string; userId?: string; entity: any };
export type EffectCtx = GuardCtx & { from: string; to: string; event: string };


export type Transition = {
from: string[];
to: string;
guards?: string[]; // names resolved by registry
effects?: string[]; // names resolved by registry
};


export type WorkflowDef = {
version: string;
entity: string;
initial: string;
states: string[];
transitions: Record<string, Transition>;
};