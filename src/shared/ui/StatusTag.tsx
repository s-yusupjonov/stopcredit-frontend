import { Tag } from 'antd';
import type { CreditStatus } from '@/shared/api/types';
import { statusLabels } from './strings';
import { colors } from '@/shared/theme';

export function StatusTag({ status }: { status: CreditStatus }) {
  const isActive = status === 'ACTIVE';
  return (
    <Tag
      style={{
        color: isActive ? colors.success : colors.danger,
        background: isActive ? colors.primarySoft : colors.dangerSoft,
        border: 'none',
        borderRadius: 999,
        padding: '2px 12px',
        fontWeight: 500,
      }}
    >
      {statusLabels[status]}
    </Tag>
  );
}
