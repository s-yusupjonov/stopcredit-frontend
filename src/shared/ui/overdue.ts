import type { CreditStage } from '@/shared/api/types';

const DAY_MS = 24 * 60 * 60 * 1000;

export const CRITICAL_OVERDUE_DAYS = 3;

export function isOverdue(stage: CreditStage, deadline: string | null, danger: boolean, now: number): boolean {
  return stage !== 'COMPLETED' && (danger || (!!deadline && new Date(deadline).getTime() <= now));
}

export function isCriticallyOverdue(stage: CreditStage, deadline: string | null, now: number): boolean {
  return (
    stage !== 'COMPLETED' &&
    !!deadline &&
    now - new Date(deadline).getTime() > CRITICAL_OVERDUE_DAYS * DAY_MS
  );
}
