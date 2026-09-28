import { Empty } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { colors } from '@/shared/theme';

interface EmptyStateProps {
  description?: string;
  action?: ReactNode;
  /** 'success' renders a green checkmark instead of the default empty-box
   *  image — for "nothing left to do" cases rather than "no data" cases. */
  tone?: 'default' | 'success';
}

export function EmptyState({
  description = 'Ma\'lumot topilmadi',
  action,
  tone = 'default',
}: EmptyStateProps) {
  return (
    <div style={{ padding: '48px 0', textAlign: 'center' }}>
      <Empty
        image={
          tone === 'success' ? (
            <CheckCircleFilled style={{ fontSize: 56, color: colors.success }} />
          ) : undefined
        }
        imageStyle={tone === 'success' ? { height: 56, marginBottom: 12 } : undefined}
        description={description}
      />
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}