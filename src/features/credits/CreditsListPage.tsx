import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Select, Switch, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  DownloadOutlined,
  SearchOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import type {
  CreditResponse,
  CreditsFilters,
  CreditStage,
  CreditStatus,
  CreditType,
} from '@/shared/api/types';
import { StatusTag } from '@/shared/ui/StatusTag';
import { StageTag } from '@/shared/ui/StageTag';
import { EmptyState } from '@/shared/ui/EmptyState';
import { SearchInput } from '@/shared/ui/SearchInput';
import { QueryErrorState } from '@/shared/ui/QueryErrorState';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useNow } from '@/shared/ui/useNow';
import { readEnum, readPage, readText } from '@/shared/ui/searchParams';
import { formatMoney, formatDate, formatRemainingTime, formatOverdueTime } from '@/shared/ui/formatters';
import { stageLabels, stageOrder, statusLabels, typeLabels } from '@/shared/ui/strings';
import { colors } from '@/shared/theme';
import { useAuth } from '@/features/auth/useAuth';
import { useDashboardSummary } from '@/features/dashboard/useDashboardSummary';
import { StatCard } from '@/features/dashboard/StatCard';
import { useCredits } from './hooks/useCredits';
import { useExportCredits } from './hooks/useExportCredits';

const PAGE_SIZE = 10;
const STATUSES = Object.keys(statusLabels) as CreditStatus[];
const TYPES = Object.keys(typeLabels) as CreditType[];
const FILTER_KEYS = ['q', 'status', 'type', 'stage', 'danger'];

interface CreditsListPageProps {
  /** 'all' = full unfiltered list (Anti-fraud's page, Management's page, and the
   *  "Barcha kreditlar" page for stage-owning roles). 'mine' = locked to the
   *  signed-in role's own stage — the "Mening bosqichim" page. */
  scope: 'all' | 'mine';
}

const toOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

export function CreditsListPage({ scope }: CreditsListPageProps) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const exportMutation = useExportCredits();
  const now = useNow();

  const isMine = scope === 'mine';
  const forcedStage = isMine ? (role as CreditStage) : undefined;

  const filters = useMemo<CreditsFilters>(
    () => ({
      q: readText(searchParams, 'q'),
      status: readEnum(searchParams, 'status', STATUSES),
      type: readEnum(searchParams, 'type', TYPES),
      stage: forcedStage ?? readEnum(searchParams, 'stage', stageOrder),
      danger: searchParams.get('danger') === 'true' ? true : undefined,
      page: readPage(searchParams),
      size: PAGE_SIZE,
    }),
    [searchParams, forcedStage],
  );
  const page = filters.page ?? 0;

  const { data, isLoading, isFetching, isPlaceholderData, isError, error, refetch } =
    useCredits(filters);

  const isAntiFraud = role === 'ANTI_FRAUD';
  const showStats = isAntiFraud || isMine;
  const { data: summary, isLoading: isSummaryLoading, isError: isSummaryError } =
    useDashboardSummary(showStats);
  const statValue = (value: number | undefined) => (isSummaryError ? '—' : (value ?? 0));
  const hasFilters = FILTER_KEYS.some((key) => searchParams.has(key));

  // A page number past the end (stale link, records moved to another stage) falls back to the last page
  const totalPages = data?.page.totalPages ?? 0;
  useEffect(() => {
    if (totalPages > 0 && page >= totalPages) {
      updateParam('page', String(totalPages - 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages, page]);

  function updateParam(key: string, value: string | undefined) {
    const next = new URLSearchParams(searchParams);
    if (value === undefined || value === '' || (key === 'page' && value === '0')) {
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
    {
      title: 'Ariza raqami',
      dataIndex: 'applicationNumber',
      key: 'applicationNumber',
      render: (v: string, record) => (
        <Link to={`/credits/${record.id}`} onClick={(event) => event.stopPropagation()}>
          {v}
        </Link>
      ),
    },
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
      align: 'right',
      render: (v: number) => <span style={{ whiteSpace: 'nowrap' }}>{formatMoney(v)}</span>,
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
        const overdue = record.danger || new Date(v).getTime() <= now;
        const text = overdue ? `+${formatOverdueTime(v)}` : formatRemainingTime(v);
        return (
          <Tooltip title={formatDate(v)}>
            <span style={{ color: overdue ? colors.danger : colors.textMuted, whiteSpace: 'nowrap' }}>
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
      render: (v: string) => <span style={{ whiteSpace: 'nowrap' }}>{formatDate(v)}</span>,
    },
  ];

  const emptyText =
    isMine && !hasFilters ? (
      <EmptyState tone="success" description="Sizning bosqichingizda ko'rib chiqiladigan kredit yo'q" />
    ) : (
      <EmptyState description={hasFilters ? "Filtr bo'yicha kredit topilmadi" : 'Kreditlar hali yo\'q'} />
    );

  return (
    <div>
      <PageHeader
        title={isMine ? 'Mening bosqichim' : 'Kreditlar'}
        subtitle={
          isMine ? "O'zingizning bosqichingizdagi kreditlar" : "Barcha stop-kreditlar ro'yxati"
        }
        actions={
          <>
            <Button
              icon={<DownloadOutlined />}
              loading={exportMutation.isPending}
              disabled={!data || data.page.totalElements === 0}
              onClick={() => exportMutation.mutate(filters)}
            >
              Excel
            </Button>
            {isAntiFraud && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/credits/new')}>
                Yangi kredit
              </Button>
            )}
          </>
        }
      />

      {showStats && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <StatCard
            label="Jami kreditlar"
            value={statValue(summary?.total)}
            icon={<FileTextOutlined />}
            loading={isSummaryLoading}
          />
          <StatCard
            label="Mening bosqichimda"
            value={statValue(summary?.ownStage)}
            icon={<ClockCircleOutlined />}
            loading={isSummaryLoading}
          />
          <StatCard
            label="Muddati o'tganlar"
            value={statValue(summary?.overdue)}
            icon={<ExclamationCircleOutlined />}
            loading={isSummaryLoading}
            tone="danger"
          />
          <StatCard
            label="Yakunlangan"
            value={statValue(summary?.completed)}
            icon={<CheckCircleOutlined />}
            loading={isSummaryLoading}
          />
        </div>
      )}

      <Card styles={{ body: { padding: 20 } }} style={{ borderRadius: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchInput
            prefix={<SearchOutlined />}
            placeholder="F.I.Sh, PINFL yoki ariza raqami"
            aria-label="Qidirish: F.I.Sh, PINFL yoki ariza raqami"
            value={filters.q}
            style={{ width: 280, maxWidth: '100%' }}
            onSearch={(value) => updateParam('q', value)}
          />
          <Select
            allowClear
            placeholder="Status"
            aria-label="Status"
            style={{ width: 150 }}
            value={filters.status}
            onChange={(v) => updateParam('status', v)}
            options={toOptions(statusLabels)}
          />
          <Select
            allowClear
            placeholder="Turi"
            aria-label="Kredit turi"
            style={{ width: 150 }}
            value={filters.type}
            onChange={(v) => updateParam('type', v)}
            options={toOptions(typeLabels)}
          />
          {!isMine && (
            <Select
              allowClear
              placeholder="Bosqich"
              aria-label="Bosqich"
              style={{ width: 190 }}
              value={filters.stage}
              onChange={(v) => updateParam('stage', v)}
              options={toOptions(stageLabels)}
            />
          )}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <Switch
              checked={filters.danger === true}
              onChange={(checked) => updateParam('danger', checked ? 'true' : undefined)}
            />
            <span style={{ fontSize: 14 }}>Faqat muddati o'tganlar</span>
          </label>
          {hasFilters && (
            <Button icon={<ClearOutlined />} onClick={() => setSearchParams(new URLSearchParams())}>
              Tozalash
            </Button>
          )}
        </div>
      </Card>

      <Card styles={{ body: { padding: 0 } }} style={{ borderRadius: 12 }}>
        {isError && !data ? (
          <QueryErrorState bare error={error} onRetry={() => void refetch()} />
        ) : (
          <Table
            rowKey="id"
            // background refetches keep the rows on screen; the spinner is for first load and filter changes
            loading={isLoading || (isFetching && isPlaceholderData)}
            columns={columns}
            dataSource={data?.content ?? []}
            scroll={{ x: 'max-content' }}
            onRow={(record) => ({
              onClick: () => navigate(`/credits/${record.id}`),
              style: {
                cursor: 'pointer',
                background: record.danger ? colors.dangerSoft : undefined,
              },
            })}
            locale={{ emptyText }}
            pagination={{
              current: page + 1,
              pageSize: PAGE_SIZE,
              total: data?.page.totalElements ?? 0,
              onChange: (next) => updateParam('page', String(next - 1)),
              showSizeChanger: false,
              showTotal: (total) => `Jami: ${total}`,
            }}
          />
        )}
      </Card>
    </div>
  );
}
