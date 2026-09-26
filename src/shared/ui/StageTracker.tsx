import { CheckOutlined, ExclamationOutlined } from '@ant-design/icons';
import type { CreditStage } from '@/shared/api/types';
import { stageLabels, stageOrder } from './strings';
import { formatRemainingTime, formatOverdueTime } from './formatters';
import styles from './StageTracker.module.css';

interface StageTrackerProps {
  currentStage: CreditStage;
  deadline: string | null;
  danger: boolean;
}

type StepState = 'done' | 'in-progress' | 'danger' | 'pending';

function getStepState(
  stepStage: CreditStage,
  currentStage: CreditStage,
  danger: boolean,
): StepState {
  const currentIndex = stageOrder.indexOf(currentStage);
  const stepIndex = stageOrder.indexOf(stepStage);
  if (stepIndex < currentIndex) return 'done';
  if (stepIndex > currentIndex) return 'pending';
  if (currentStage === 'COMPLETED') return 'done';
  return danger ? 'danger' : 'in-progress';
}

export function StageTracker({ currentStage, deadline, danger }: StageTrackerProps) {
  return (
    <div className={styles.tracker}>
      {stageOrder.map((stage) => {
        const state = getStepState(stage, currentStage, danger);
        const isCurrent = stage === currentStage && currentStage !== 'COMPLETED';

        return (
          <div
            key={stage}
            className={`${styles.step} ${state === 'danger' ? styles.dangerBg : ''}`}
          >
            <div className={`${styles.connector} ${state !== 'pending' ? styles.connectorFilled : ''}`} />
            <div
              className={`${styles.circle} ${
                state === 'done'
                  ? styles.circleDone
                  : state === 'in-progress'
                    ? styles.circleInProgress
                    : state === 'danger'
                      ? styles.circleDanger
                      : ''
              }`}
            >
              {state === 'done' && <CheckOutlined />}
              {state === 'danger' && <ExclamationOutlined />}
              {(state === 'in-progress' || state === 'pending') &&
                stageOrder.indexOf(stage) + 1}
            </div>
            <div
              className={`${styles.label} ${
                state === 'danger'
                  ? styles.labelDanger
                  : isCurrent
                    ? styles.labelActive
                    : ''
              }`}
            >
              {stageLabels[stage]}
            </div>
            {isCurrent && state === 'in-progress' && deadline && (
              <div className={styles.caption}>{formatRemainingTime(deadline)}</div>
            )}
            {isCurrent && state === 'danger' && (
              <div className={styles.captionDanger}>
                Muddati o'tgan{deadline ? ` · ${formatOverdueTime(deadline)}` : ''}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
