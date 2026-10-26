import { CheckOutlined, ExclamationOutlined, FieldTimeOutlined } from '@ant-design/icons';
import type { CreditStage, StageHistoryEntry } from '@/shared/api/types';
import { stageLabels, stageOrder } from './strings';
import { formatDate, formatOverdueTime, formatRemainingTime } from './formatters';
import { formatDuration, getStepState, getTimes, type StepState } from './stageTimeline';
import { isOverdue } from './overdue';
import { useNow } from './useNow';
import styles from './StageFlow.module.css';

interface StageFlowProps {
  currentStage: CreditStage;
  deadline: string | null;
  danger: boolean;
  createdAt: string;
  history: StageHistoryEntry[] | null;
}

interface FlowStep {
  stage: CreditStage;
  state: StepState;
  receivedAt: string | null;
  completedAt: string | null;
}

const TONE: Record<StepState, string> = {
  done: styles.done,
  'in-progress': styles.active,
  danger: styles.danger,
  pending: styles.pending,
};

function chipText(step: FlowStep, deadline: string | null): string {
  const isFinal = step.stage === 'COMPLETED';
  switch (step.state) {
    case 'done':
      if (isFinal) return 'Yakunlandi';
      return step.receivedAt && step.completedAt ? formatDuration(step.receivedAt, step.completedAt) : '—';
    case 'in-progress':
      return deadline ? formatRemainingTime(deadline) : 'Jarayonda';
    case 'danger': {
      const overdue = formatOverdueTime(deadline);
      return overdue ? `Muddati o'tgan · +${overdue}` : "Muddati o'tgan";
    }
    default:
      return 'Kutilmoqda';
  }
}

function notes(step: FlowStep, deadline: string | null): string[] {
  const isFinal = step.stage === 'COMPLETED';
  switch (step.state) {
    case 'done':
      return isFinal
        ? [`Yakunlandi: ${formatDate(step.receivedAt)}`]
        : [`Qabul: ${formatDate(step.receivedAt)}`, `Bajardi: ${formatDate(step.completedAt)}`];
    case 'pending':
      return [];
    default:
      return [`Qabul: ${formatDate(step.receivedAt)}`, `Muddat: ${formatDate(deadline)}`];
  }
}

function marker(state: StepState, index: number) {
  if (state === 'done') return <CheckOutlined />;
  if (state === 'danger') return <ExclamationOutlined />;
  return index + 1;
}

export function StageFlow({ currentStage, deadline, danger: serverDanger, createdAt, history }: StageFlowProps) {
  const now = useNow();
  const danger = isOverdue(currentStage, deadline, serverDanger, now);

  const steps: FlowStep[] = stageOrder.map((stage) => ({
    stage,
    state: getStepState(stage, currentStage, danger),
    ...getTimes(stage, history, createdAt),
  }));

  const finishedAt = steps[steps.length - 1].receivedAt;
  const end = currentStage === 'COMPLETED' && finishedAt ? finishedAt : new Date(now).toISOString();

  return (
    <div className={styles.flow}>
      <div className={styles.summary}>
        <FieldTimeOutlined />
        <span>
          Jami vaqt: <strong>{formatDuration(createdAt, end)}</strong>
        </span>
      </div>

      <ol className={styles.steps}>
        {steps.map((step, index) => (
          <li key={step.stage} className={`${styles.step} ${TONE[step.state]}`}>
            <span className={styles.circle}>{marker(step.state, index)}</span>
            <span className={styles.label}>{stageLabels[step.stage]}</span>
            <span className={styles.chip}>{chipText(step, deadline)}</span>
            {notes(step, deadline).map((line) => (
              <span key={line} className={styles.note}>
                {line}
              </span>
            ))}
          </li>
        ))}
      </ol>
    </div>
  );
}
