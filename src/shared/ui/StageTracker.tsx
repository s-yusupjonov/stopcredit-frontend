import {
  CheckOutlined,
  ClockCircleOutlined,
  ExclamationOutlined,
  LoginOutlined,
  LogoutOutlined,
  FieldTimeOutlined,
  SendOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import type { CreditStage, StageHistoryEntry } from '@/shared/api/types';
import { stageLabels, stageOrder } from './strings';
import { formatDate, formatRemainingTime, formatOverdueTime } from './formatters';
import { useNow } from './useNow';
import { isOverdue } from './overdue';
import { formatDuration, getStepState, getTimes } from './stageTimeline';
import styles from './StageTracker.module.css';

interface StageTrackerProps {
  currentStage: CreditStage;
  deadline: string | null;
  danger: boolean;
  createdAt: string;
  history: StageHistoryEntry[] | null;
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowIcon}>{icon}</span>
      <div className={styles.rowBody}>
        <span className={styles.rowLabel}>{label}</span>
        <span className={styles.rowValue}>{value}</span>
      </div>
    </div>
  );
}

export function StageTracker({
  currentStage,
  deadline,
  danger: serverDanger,
  createdAt,
  history,
}: StageTrackerProps) {
  const now = useNow();
  const danger = isOverdue(currentStage, deadline, serverDanger, now);

  return (
    <div className={styles.tracker}>
      {stageOrder.map((stage, index) => {
        const state = getStepState(stage, currentStage, danger);
        const isCurrent = stage === currentStage && currentStage !== 'COMPLETED';
        const isFinal = stage === 'COMPLETED';
        const { receivedAt, completedAt } = getTimes(stage, history, createdAt);
        const nextLabel = isFinal ? null : stageLabels[stageOrder[index + 1]];

        return (
          <div key={stage} className={styles.step}>
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
              {(state === 'in-progress' || state === 'pending') && index + 1}
            </div>

            <div
              className={`${styles.card} ${
                state === 'danger'
                  ? styles.cardDanger
                  : isCurrent
                    ? styles.cardActive
                    : state === 'pending'
                      ? styles.cardPending
                      : ''
              }`}
            >
              <div
                className={`${styles.label} ${
                  state === 'danger' ? styles.labelDanger : isCurrent ? styles.labelActive : ''
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

              <div className={styles.rows}>
                {state === 'pending' && <div className={styles.waiting}>Kutilmoqda</div>}

                {state !== 'pending' && !isFinal && (
                  <InfoRow
                    icon={<LoginOutlined />}
                    label="Qabul qildi"
                    value={receivedAt ? formatDate(receivedAt) : '—'}
                  />
                )}

                {isCurrent && (
                  <InfoRow
                    icon={<ClockCircleOutlined />}
                    label="Holat"
                    value={state === 'danger' ? 'Muddati o\'tgan' : 'Jarayonda'}
                  />
                )}

                {state === 'done' && !isFinal && (
                  <>
                    <InfoRow
                      icon={<LogoutOutlined />}
                      label="Bajardi"
                      value={completedAt ? formatDate(completedAt) : '—'}
                    />
                    {receivedAt && completedAt && (
                      <InfoRow
                        icon={<FieldTimeOutlined />}
                        label="Sarflangan vaqt"
                        value={formatDuration(receivedAt, completedAt)}
                      />
                    )}
                    <InfoRow icon={<SendOutlined />} label="O'tkazildi" value={nextLabel} />
                  </>
                )}

                {isFinal && state === 'done' && (
                  <InfoRow
                    icon={<CheckOutlined />}
                    label="Yakunlandi"
                    value={receivedAt ? formatDate(receivedAt) : '—'}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
