import { Tag } from 'antd';
import { ExclamationCircleFilled, CheckCircleFilled, ClockCircleFilled } from '@ant-design/icons';
import type { CreditStage } from '@/shared/api/types';
import { stageLabels } from './strings';
import { colors } from '@/shared/theme';

interface StageTagProps {
  stage: CreditStage;
  danger?: boolean;
}

export function StageTag({ stage, danger }: StageTagProps) {
  if (danger && stage !== 'COMPLETED') {
    return (
      <Tag
        icon={<ExclamationCircleFilled />}
        style={{
          color: colors.danger,
          background: colors.dangerSoft,
          border: `1px solid ${colors.danger}33`,
          borderRadius: 999,
          padding: '2px 12px',
          fontWeight: 500,
        }}
      >
        {stageLabels[stage]}
      </Tag>
    );
  }

  if (stage === 'COMPLETED') {
    return (
      <Tag
        icon={<CheckCircleFilled />}
        style={{
          color: colors.success,
          background: colors.primarySoft,
          border: 'none',
          borderRadius: 999,
          padding: '2px 12px',
          fontWeight: 500,
        }}
      >
        {stageLabels[stage]}
      </Tag>
    );
  }

  return (
    <Tag
      icon={<ClockCircleFilled />}
      style={{
        color: colors.primary,
        background: colors.primarySoft,
        border: 'none',
        borderRadius: 999,
        padding: '2px 12px',
        fontWeight: 500,
      }}
    >
      {stageLabels[stage]}
    </Tag>
  );
}
