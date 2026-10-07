import { Card, Skeleton } from 'antd';
import type { ReactNode } from 'react';
import { colors } from '@/shared/theme';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  loading?: boolean;
  tone?: 'primary' | 'danger';
}

export function StatCard({ label, value, icon, loading, tone = 'primary' }: StatCardProps) {
  const iconColor = tone === 'danger' ? colors.danger : colors.primary;
  const iconBg = tone === 'danger' ? colors.dangerSoft : colors.primarySoft;

  return (
    <Card style={{ borderRadius: 12, flex: '1 1 200px' }} styles={{ body: { padding: 20 } }}>
      {loading ? (
        <Skeleton active paragraph={{ rows: 1 }} />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: iconBg,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
          >
            {icon}
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: colors.text, lineHeight: 1.2 }}>
              {value}
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted }}>{label}</div>
          </div>
        </div>
      )}
    </Card>
  );
}
