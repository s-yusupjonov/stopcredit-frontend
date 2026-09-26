import { Navigate, useNavigate } from 'react-router-dom';
import { Card, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  FileTextOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { CreditResponse } from '@/shared/api/types';
import { StatusTag } from '@/shared/ui/StatusTag';
import { StageTag } from '@/shared/ui/StageTag';
import { EmptyState } from '@/shared/ui/EmptyState';
import { formatMoney, formatDate } from '@/shared/ui/formatters';
import { colors } from '@/shared/theme';
import { useAuth } from '@/features/auth/useAuth';
import { useDashboardSummary } from './useDashboardSummary';
import { StatCard } from './StatCard';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { data, isLoading } = useDashboardSummary();

  if (role === 'ADMIN') {
    return <Navigate to="/users" replace />;
  }

  const credits = data?.content ?? [];
  const total = data?.page.totalElements ?? 0;
  const dangerCount = credits.filter((c) => c.danger).length;
  const completedCount = credits.filter((c) => c.stage === 'COMPLETED').length;
  const myStageCount = role
    ? credits.filter((c) => c.stage === role).length
    : 0;

  const columns: ColumnsType<CreditResponse> = [
    { title: 'Ariza raqami', dataIndex: 'applicationNumber', key: 'applicationNumber' },
    {
      title: 'F.I.Sh.',
      key: 'fullName',
      render: (_, record) => `${record.lastName} ${record.firstName}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v) => <StatusTag status={v} />,
    },
    {
      title: 'Bosqich',
      dataIndex: 'stage',
      key: 'stage',
      render: (v, record) => <StageTag stage={v} danger={record.danger} />,
    },
    { title: 'Summa', dataIndex: 'amount', key: 'amount', render: (v) => formatMoney(v) },
    { title: 'Yaratilgan', dataIndex: 'createdAt', key: 'createdAt', render: formatDate },
  ];

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Xush kelibsiz, {user?.fullName}
      </Typography.Title>
      <Typography.Text type="secondary">Tizim holati va so'nggi kreditlar</Typography.Text>

      <div style={{ display: 'flex', gap: 16, margin: '20px 0', flexWrap: 'wrap' }}>
        <StatCard label="Jami kreditlar" value={total} icon={<FileTextOutlined />} loading={isLoading} />
        {role && role !== 'MANAGEMENT' && role !== 'ADMIN' && (
          <StatCard
            label="Mening bosqichimda"
            value={myStageCount}
            icon={<ClockCircleOutlined />}
            loading={isLoading}
          />
        )}
        <StatCard
          label="Muddati o'tganlar"
          value={dangerCount}
          icon={<ExclamationCircleOutlined />}
          loading={isLoading}
          tone="danger"
        />
        <StatCard
          label="Yakunlangan"
          value={completedCount}
          icon={<CheckCircleOutlined />}
          loading={isLoading}
        />
      </div>

      <Card title="So'nggi kreditlar" style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={credits.slice(0, 5)}
          pagination={false}
          onRow={(record) => ({
            onClick: () => navigate(`/credits/${record.id}`),
            style: { cursor: 'pointer', background: record.danger ? colors.dangerSoft : undefined },
          })}
          locale={{ emptyText: <EmptyState /> }}
        />
      </Card>
    </div>
  );
}
