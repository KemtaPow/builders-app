import { GuardRegistry } from './workflow.engine.js';
export const guards: GuardRegistry = {
hasSchedule: ({ entity }) => !!entity?.scheduledAt,
};