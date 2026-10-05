import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Select, Switch, Table, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  DownloadOutlined,
  SearchOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { CreditResponse, CreditStage, CreditStatus, CreditType } from '@/shared/api/types';
import { StatusTag } from '@/shared/ui/StatusTag';
import { StageTag } from '@/shared/ui/StageTag';
import { EmptyState } from '@/shared/ui/EmptyState';
import { SearchInput } from '@/shared/ui/SearchInput';
import { formatMoney, formatDate, formatRemainingTime, formatOverdueTime } from '@/shared/ui/formatters';
import { stageLabels, statusLabels, typeLabels } from '@/shared/ui/strings';
import { colors } from '@/shared/theme';
import { useAuth } from '@/features/auth/useAuth';
import { useDashboardSummary } from '@/features/dashboard/useDashboardSummary';
import { StatCard } from '@/features/dashboard/StatCard';
import { useCredits } from './hooks/useCredits';
import { useExportCredits } from './hooks/useExportCredits';

const PAGE_SIZE = 10;

interface CreditsListPageProps {
  /** 'all' = full unfiltered list (Anti-fraud's page, Management's page, and the
   *  "Barcha kreditlar" page for stage-owning roles). 'mine' = locked to the
   *  signed-in role's own stage — the "Mening bosqichim" page. */
  scope: 'all' | 'mine';
}

export function CreditsListPage({ scope }: CreditsListPageProps) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const exportMutation = useExportCredits();

  const isMine = scope === 'mine';
  const forcedStage = isMine ? (role as CreditStage) : undefined;

  const filters = useMemo(
    () => ({
      q: searchParams.get('q') ?? undefined,
      status: (searchParams.get('status') as CreditStatus | null) ?? undefined,
      type: (searchParams.get('type') as CreditType | null) ?? undefined,
      stage: forcedStage ?? (searchParams.get('stage') as CreditStage | null) ?? undefined,
      danger: searchParams.get('danger') === 'true' ? true : undefined,
      page: Number(searchParams.get('page') ?? '0'),
      size: PAGE_SIZE,
      sort: searchParams.get('sort') ?? undefined,
    }),
    [searchParams, forcedStage],
  );

  const { data, isLoading, isFetching } = useCredits(filters);

  const isAntiFraud = role === 'ANTI_FRAUD';
  const showStats = isAntiFraud || isMine;
  const { data: summaryData, isLoading: isSummaryLoading } = useDashboardSummary(showStats);
  const summaryCredits = summaryData?.content ?? [];
  const totalCount = summaryData?.page.totalElements ?? 0;
  const dangerCount = summaryCredits.filter((c) => c.danger).length;
  const completedCount = summaryCredits.filter((c) => c.stage === 'COMPLETED').length;
  const myStageCount = role ? summaryCredits.filter((c) => c.stage === role).length : 0;

  function updateParam(key: string, value: string | undefined) {
    const next = new URLSearchParams(searchParams);
    if (value === undefined || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    if (key !== 'page') {
      next.delete('page');
    }
    setSearchParams(next);
  }

  const columns: ColumnsType<CreditResponse> = [
    { title: 'Ariza raqami', dataIndex: 'applicationNumber', key: 'applicationNumber' },
    {
      title: 'F.I.Sh.',
      key: 'fullName',
      render: (_, record) =>
        `${record.lastName} ${record.firstName} ${record.middleName ?? ''}`.trim(),
    },
    { title: 'PINFL', dataIndex: 'pinfl', key: 'pinfl' },
    { title: 'Turi', dataIndex: 'type', key: 'type', render: (v: CreditType) => typeLabels[v] },
    { title: 'MFO', dataIndex: 'mfo', key: 'mfo' },
    {
      title: 'Summa',
      dataIndex: 'amount',
      key: 'amount',
      render: (v: number) => formatMoney(v),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: CreditStatus) => <StatusTag status={v} />,
    },
    {
      title: 'Bosqich',
      dataIndex: 'stage',
      key: 'stage',
      render: (v: CreditStage, record) => <StageTag stage={v} danger={record.danger} />,
    },
    {
      title: 'Muddat',
      dataIndex: 'stageDeadline',
      key: 'stageDeadline',
      render: (v: string | null, record) => {
        if (!v || record.stage === 'COMPLETED') return '—';
        const text = record.danger ? `+${formatOverdueTime(v)}` : formatRemainingTime(v);
        return (
          <Tooltip title={formatDate(v)}>
            <span style={{ color: record.danger ? colors.danger : colors.textMuted }}>
              {text}
            </span>
          </Tooltip>
        );
      },
    },
    { title: 'Yaratdi', dataIndex: 'createdBy', key: 'createdBy' },
    {
      title: 'Yaratilgan',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => formatDate(v),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {isMine ? 'Mening bosqichim' : 'Kreditlar'}
          </Typography.Title>
          <Typography.Text type="secondary">
            {isMine
              ? "O'zingizning bosqichingizdagi kreditlar"
              : "Barcha stop-kreditlar ro'yxati"}
          </Typography.Text>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            icon={<DownloadOutlined />}
            loading={exportMutation.isPending}
            onClick={() => exportMutation.mutate(filters)}
          >
            Excel
          </Button>
          {isAntiFraud && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/credits/new')}
            >
              Yangi kredit
            </Button>
          )}
        </div>
      </div>

      {showStats && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <StatCard
            label="Jami kreditlar"
            value={totalCount}
            icon={<FileTextOutlined />}
            loading={isSummaryLoading}
          />
          <StatCard
            label="Mening bosqichimda"
            value={myStageCount}
            icon={<ClockCircleOutlined />}
            loading={isSummaryLoading}
          />
          <StatCard
            label="Muddati o'tganlar"
            value={dangerCount}
            icon={<ExclamationCircleOutlined />}
            loading={isSummaryLoading}
            tone="danger"
          />
          <StatCard
            label="Yakunlangan"
            value={completedCount}
            icon={<CheckCircleOutlined />}
            loading={isSummaryLoading}
          />
        </div>
      )}

      <Card styles={{ body: { padding: 20 } }} style={{ borderRadius: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <SearchInput
            prefix={<SearchOutlined />}
            placeholder="F.I.Sh, PINFL yoki ariza raqami"
            value={filters.q}
            style={{ width: 260 }}
            onSearch={(value) => updateParam('q', value)}
          />
          <Select
            allowClear
            placeholder="Status"
            style={{ width: 150 }}
            value={filters.status}
            onChange={(v) => updateParam('status', v)}
            options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
          />
          <Select
            allowClear
            placeholder="Turi"
            style={{ width: 150 }}
            value={filters.type}
            onChange={(v) => updateParam('type', v)}
            options={Object.entries(typeLabels).map(([value, label]) => ({ value, label }))}
          />
          {!isMine && (
            <Select
              allowClear
              placeholder="Bosqich"
              style={{ width: 190 }}
              value={filters.stage}
              onChange={(v) => updateParam('stage', v)}
              options={Object.entries(stageLabels).map(([value, label]) => ({ value, label }))}
            />
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Switch
              checked={filters.danger === true}
              onChange={(checked) => updateParam('danger', checked ? 'true' : undefined)}
            />
            <span style={{ fontSize: 14 }}>Faqat muddati o'tganlar</span>
          </div>
        </div>
      </Card>

      <Card styles={{ body: { padding: 0 } }} style={{ borderRadius: 12 }}>
        <Table
          rowKey="id"
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={data?.content ?? []}
          onRow={(record) => ({
            onClick: () => navigate(`/credits/${record.id}`),
            style: {
              cursor: 'pointer',
              background: record.danger ? colors.dangerSoft : undefined,
            },
          })}
          locale={{
            emptyText: isMine ? (
              <EmptyState
                tone="success"
                description="Sizning bosqichingizda muammoli kreditlar topilmadi"
              />
            ) : (
              <EmptyState />
            ),
          }}
          pagination={{
            current: filters.page! + 1,
            pageSize: PAGE_SIZE,
            total: data?.page.totalElements ?? 0,
            onChange: (page) => updateParam('page', String(page - 1)),
            showSizeChanger: false,
          }}
        />
      </Card>
    </div>
  );
}