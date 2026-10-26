import dayjs from 'dayjs';
import type { CreditStage, StageHistoryEntry } from '@/shared/api/types';
import { stageOrder } from './strings';

export type StepState = 'done' | 'in-progress' | 'danger' | 'pending';

export function getStepState(stepStage: CreditStage, currentStage: CreditStage, danger: boolean): StepState {
  const currentIndex = stageOrder.indexOf(currentStage);
  const stepIndex = stageOrder.indexOf(stepStage);
  if (stepIndex < currentIndex) return 'done';
  if (stepIndex > currentIndex) return 'pending';
  if (currentStage === 'COMPLETED') return 'done';
  return danger ? 'danger' : 'in-progress';
}

export function formatDuration(from: string, to: string): string {
  const minutes = Math.max(dayjs(to).diff(dayjs(from), 'minute'), 0);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days} kun ${hours} soat`;
  if (hours > 0) return `${hours} soat ${mins} daqiqa`;
  return `${mins} daqiqa`;
}

function findEntry(history: StageHistoryEntry[] | null, stage: CreditStage) {
  return history?.find((entry) => entry.stage === stage) ?? null;
}

export function getTimes(
  stage: CreditStage,
  history: StageHistoryEntry[] | null,
  createdAt: string,
): { receivedAt: string | null; completedAt: string | null } {
  const index = stageOrder.indexOf(stage);
  const entry = findEntry(history, stage);
  const previous = index > 0 ? findEntry(history, stageOrder[index - 1]) : null;
  const next = index < stageOrder.length - 1 ? findEntry(history, stageOrder[index + 1]) : null;
  const receivedAt = entry?.receivedAt ?? (index === 0 ? createdAt : (previous?.completedAt ?? null));
  const completedAt = entry?.completedAt ?? next?.receivedAt ?? null;
  return { receivedAt, completedAt };
}
