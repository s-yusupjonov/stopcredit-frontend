import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Button, Card, DatePicker, Select, Table, Tag, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  DownloadOutlined,
  SearchOutlined,
  ClearOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import type {
  CardBasisCategory,
  CardResponse,
  CardRestrictionType,
  CardStatus,
  ExecutorResponse,
} from '@/shared/api/types';
import { EmptyState } from '@/shared/ui/EmptyState';
import { SearchInput } from '@/shared/ui/SearchInput';
import { QueryErrorState } from '@/shared/ui/QueryErrorState';
import {
  formatCardNumber,
  formatDate,
  formatDateShort,
  formatExecutor,
  formatMoney,
} from '@/shared/ui/formatters';
import { cardBasisLabels, cardRestrictionLabels } from '@/shared/ui/strings';
import { useAuth } from '@/features/auth/useAuth';
import { useCards } from './hooks/useCards';
import { useExecutors } from './hooks/useExecutors';
import { useExportCards } from './hooks/useExportCards';
import { UnblockCardModal } from './UnblockCardModal';

const PAGE_SIZE = 10;

interface CardsListPageProps {
  status: CardStatus;
}

function TruncatedText({ value }: { value: string | null }) {
  if (!value) return <>—</>;
  return (
    <Tooltip title={value}>
      <span
        style={{
          display: 'inline-block',
          maxWidth: 200,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          verticalAlign: 'bottom',
        }}
      >
        {value}
      </span>
    </Tooltip>
  );
}

const pageMeta: Record<CardStatus, { title: string; subtitle: string; fileLabel: string }> = {
  BLOCKED: {
    title: 'Bloklangan kartalar',
    subtitle: "Cheklov qo'yilgan kartalar ro'yxati",
    fileLabel: 'bloklangan',
  },
  ACTIVE: {
    title: 'Aktiv kartalar',
    subtitle: "Faol holatdagi kartalar ro'yxati",
    fileLabel: 'aktiv',
  },
};

export function CardsListPage({ status }: CardsListPageProps) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const meta = pageMeta[status];
  const exportMutation = useExportCards(meta.fileLabel);
  const { data: executors = [], isLoading: isLoadingExecutors } = useExecutors();
  const [unblockTarget, setUnblockTarget] = useState<CardResponse | null>(null);

  const filters = useMemo(() => {
    const executorId = searchParams.get('executorId');
    return {
      q: searchParams.get('q') ?? undefined,
      status,
      mfo: searchParams.get('mfo') ?? undefined,
      restrictionType: (searchParams.get('restrictionType') as CardRestrictionType | null) ?? undefined,
      basisCategory: (searchParams.get('basisCategory') as CardBasisCategory | null) ?? undefined,
      executorId: executorId ? Number(executorId) : undefined,
      dateFrom: searchParams.get('dateFrom') ?? undefined,
      dateTo: searchParams.get('dateTo') ?? undefined,
      page: Number(searchParams.get('page') ?? '0'),
      size: PAGE_SIZE,
      sort: searchParams.get('sort') ?? undefined,
    };
  }, [searchParams, status]);

  const { data, isLoading, isFetching, isError, error, refetch } = useCards(filters);

  const hasFilters = ['q', 'mfo', 'restrictionType', 'basisCategory', 'executorId', 'dateFrom', 'dateTo'].some(
    (key) => searchParams.has(key),
  );

  function updateParams(changes: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    if (!('page' in changes)) {
      next.delete('page');
    }
    setSearchParams(next);
  }

  const baseColumns: ColumnsType<CardResponse> = [
    { title: 'T/r', dataIndex: 'id', key: 'id', width: 80 },
    {
      title: 'Karta raqami',
      dataIndex: 'cardNumber',
      key: 'cardNumber',
      render: (v: string) => formatCardNumber(v),
    },
    { title: 'MFO', dataIndex: 'mfo', key: 'mfo', render: (v: string | null) => v ?? '—' },
    {
      title: 'Sana',
      dataIndex: 'restrictionDate',
      key: 'restrictionDate',
      render: (v: string | null) => formatDateShort(v),
    },
    {
      title: 'Karta balansi',
      dataIndex: 'balance',
      key: 'balance',
      render: (v: number | null | undefined) => (typeof v === 'number' ? formatMoney(v) : '—'),
    },
    {
      title: 'Cheklov turi',
      dataIndex: 'restrictionType',
      key: 'restrictionType',
      render: (v: CardRestrictionType | null) => (v ? cardRestrictionLabels[v] : '—'),
    },
    {
      title: 'Asos',
      dataIndex: 'basisCategory',
      key: 'basisCategory',
      render: (v: CardBasisCategory) => <Tag>{cardBasisLabels[v]}</Tag>,
    },
    {
      title: 'Buyruq raqami',
      dataIndex: 'basisComment',
      key: 'basisComment',
      width: 220,
      render: (v: string | null) => <TruncatedText value={v} />,
    },
    {
      title: 'Eslatma',
      dataIndex: 'statusComment',
      key: 'statusComment',
      width: 220,
      render: (v: string | null) => <TruncatedText value={v} />,
    },
    {
      title: 'Ijrochi',
      dataIndex: 'executor',
      key: 'executor',
      render: (v: ExecutorResponse) => formatExecutor(v),
    },
    { title: 'Yuboruvchi', dataIndex: 'senderName', key: 'senderName' },
    {
      title: 'Yaratilgan',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => formatDate(v),
    },
  ];

  const unblockInfoColumns: ColumnsType<CardResponse> = [
    {
      title: 'Ochish buyruqi',
      dataIndex: 'unblockOrderNumber',
      key: 'unblockOrderNumber',
      width: 220,
      render: (v: string | null | undefined) => <TruncatedText value={v ?? null} />,
    },
    {
      title: 'Ochilgan sana',
      dataIndex: 'unblockedAt',
      key: 'unblockedAt',
      render: (v: string | null | undefined) => formatDate(v),
    },
  ];

  const actionColumns: ColumnsType<CardResponse> = [
    {
      title: '',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Button
          size="small"
          icon={<UnlockOutlined />}
          onClick={(event) => {
            event.stopPropagation();
            setUnblockTarget(record);
          }}
        >
          Blokdan ochish
        </Button>
      ),
    },
  ];

  const canUnblock = role === 'ANTI_FRAUD' && status === 'BLOCKED';
  const columns: ColumnsType<CardResponse> = [
    ...baseColumns,
    ...(status === 'ACTIVE' ? unblockInfoColumns : []),
    ...(canUnblock ? actionColumns : []),
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
            {meta.title}
          </Typography.Title>
          <Typography.Text type="secondary">{meta.subtitle}</Typography.Text>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            icon={<DownloadOutlined />}
            loading={exportMutation.isPending}
            onClick={() => exportMutation.mutate(filters)}
          >
            Excel
          </Button>
          {role === 'ANTI_FRAUD' && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/cards/new')}>
              Yangi karta
            </Button>
          )}
        </div>
      </div>

      <Card styles={{ body: { padding: 20 } }} style={{ borderRadius: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <SearchInput
            prefix={<SearchOutlined />}
            placeholder="Karta raqami, ijrochi, yuboruvchi yoki buyruq"
            value={filters.q}
            style={{ width: 320 }}
            onSearch={(value) => updateParams({ q: value })}
          />
          <SearchInput
            placeholder="MFO"
            value={filters.mfo}
            style={{ width: 110 }}
            maxLength={10}
            onSearch={(value) => updateParams({ mfo: value })}
          />
          <Select
            allowClear
            placeholder="Cheklov turi"
            style={{ width: 150 }}
            value={filters.restrictionType}
            onChange={(v) => updateParams({ restrictionType: v })}
            options={Object.entries(cardRestrictionLabels).map(([value, label]) => ({ value, label }))}
          />
          <Select
            allowClear
            placeholder="Asos"
            style={{ width: 200 }}
            value={filters.basisCategory}
            onChange={(v) => updateParams({ basisCategory: v })}
            options={Object.entries(cardBasisLabels).map(([value, label]) => ({ value, label }))}
          />
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Ijrochi"
            style={{ width: 260 }}
            loading={isLoadingExecutors}
            value={filters.executorId}
            onChange={(v) => updateParams({ executorId: v === undefined ? undefined : String(v) })}
            options={executors.map((e) => ({ value: e.id, label: formatExecutor(e) }))}
          />
          <DatePicker.RangePicker
            format="DD.MM.YYYY"
            placeholder={['Sana dan', 'Sana gacha']}
            value={[
              filters.dateFrom ? dayjs(filters.dateFrom) : null,
              filters.dateTo ? dayjs(filters.dateTo) : null,
            ]}
            onChange={(range) =>
              updateParams({
                dateFrom: range?.[0] ? range[0].format('YYYY-MM-DD') : undefined,
                dateTo: range?.[1] ? range[1].format('YYYY-MM-DD') : undefined,
              })
            }
          />
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
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={data?.content ?? []}
          scroll={{ x: 'max-content' }}
          onRow={(record) => ({
            onClick: () => navigate(`/cards/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          locale={{ emptyText: <EmptyState /> }}
          pagination={{
            current: filters.page + 1,
            pageSize: PAGE_SIZE,
            total: data?.page.totalElements ?? 0,
            onChange: (page) => updateParams({ page: String(page - 1) }),
            showSizeChanger: false,
            showTotal: (total) => `Jami: ${total}`,
          }}
        />
        )}
      </Card>

      <UnblockCardModal card={unblockTarget} onClose={() => setUnblockTarget(null)} />
    </div>
  );
}