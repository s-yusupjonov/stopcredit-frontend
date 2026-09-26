import { Empty } from 'antd';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ description = 'Ma\'lumot topilmadi', action }: EmptyStateProps) {
  return (
    <div style={{ padding: '48px 0', textAlign: 'center' }}>
      <Empty description={description} />
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
