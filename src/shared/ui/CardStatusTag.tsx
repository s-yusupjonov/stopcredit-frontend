import { Tag } from 'antd';
import type { CardStatus } from '@/shared/api/types';
import { cardStatusLabels } from './strings';
import { colors } from '@/shared/theme';

export function CardStatusTag({ status }: { status: CardStatus }) {
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
      {cardStatusLabels[status]}
    </Tag>
  );
}
