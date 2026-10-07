import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Button, Card, DatePicker, Select, Table, Tag, Tooltip } from 'antd';
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
  CardsFilters,
  CardStatus,
  ExecutorResponse,
} from '@/shared/api/types';
import { EmptyState } from '@/shared/ui/EmptyState';
import { SearchInput } from '@/shared/ui/SearchInput';
import { QueryErrorState } from '@/shared/ui/QueryErrorState';
import { PageHeader } from '@/shared/ui/PageHeader';
import { readEnum, readIsoDate, readPage, readPositiveInt, readText } from '@/shared/ui/searchParams';
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
const RESTRICTION_TYPES = Object.keys(cardRestrictionLabels) as CardRestrictionType[];
const BASIS_CATEGORIES = Object.keys(cardBasisLabels) as CardBasisCategory[];
const FILTER_KEYS = ['q', 'mfo', 'restrictionType', 'basisCategory', 'executorId', 'dateFrom', 'dateTo'];

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

const toOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

export function CardsListPage({ status }: CardsListPageProps) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const meta = pageMeta[status];
  const exportMutation = useExportCards(meta.fileLabel);
  const { data: executors = [], isLoading: isLoadingExecutors } = useExecutors();
  const [unblockTarget, setUnblockTarget] = useState<CardResponse | null>(null);

  const filters = useMemo<CardsFilters>(
    () => ({
      q: readText(searchParams, 'q'),
      status,
      mfo: readText(searchParams, 'mfo'),
      restrictionType: readEnum(searchParams, 'restrictionType', RESTRICTION_TYPES),
      basisCategory: readEnum(searchParams, 'basisCategory', BASIS_CATEGORIES),
      executorId: readPositiveInt(searchParams, 'executorId'),
      dateFrom: readIsoDate(searchParams, 'dateFrom'),
      dateTo: readIsoDate(searchParams, 'dateTo'),
      page: readPage(searchParams),
      size: PAGE_SIZE,
    }),
    [searchParams, status],
  );
  const page = filters.page ?? 0;

  const { data, isLoading, isFetching, isPlaceholderData, isError, error, refetch } =
    useCards(filters);

  const hasFilters = FILTER_KEYS.some((key) => searchParams.has(key));

  const totalPages = data?.page.totalPages ?? 0;
  useEffect(() => {
    if (totalPages > 0 && page >= totalPages) {
      updateParams({ page: String(totalPages - 1) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages, page]);

  function updateParams(changes: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === undefined || value === '' || (key === 'page' && value === '0')) {
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
      render: (v: string, record) => (
        <Link
          to={`/cards/${record.id}`}
          style={{ whiteSpace: 'nowrap' }}
          onClick={(event) => event.stopPropagation()}
        >
          {formatCardNumber(v)}
        </Link>
      ),
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
      align: 'right',
      render: (v: number | null) => <span style={{ whiteSpace: 'nowrap' }}>{formatMoney(v)}</span>,
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
      render: (v: string) => <span style={{ whiteSpace: 'nowrap' }}>{formatDate(v)}</span>,
    },
  ];

  const unblockInfoColumns: ColumnsType<CardResponse> = [
    {
      title: 'Ochish buyrug\'i',
      dataIndex: 'unblockOrderNumber',
      key: 'unblockOrderNumber',
      width: 220,
      render: (v: string | null) => <TruncatedText value={v} />,
    },
    {
      title: 'Ochilgan sana',
      dataIndex: 'unblockedAt',
      key: 'unblockedAt',
      render: (v: string | null) => <span style={{ whiteSpace: 'nowrap' }}>{formatDate(v)}</span>,
    },
  ];

  const actionColumns: ColumnsType<CardResponse> = [
    {
      title: 'Amal',
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
      <PageHeader
        title={meta.title}
        subtitle={meta.subtitle}
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
            {role === 'ANTI_FRAUD' && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/cards/new')}>
                Yangi karta
              </Button>
            )}
          </>
        }
      />

      <Card styles={{ body: { padding: 20 } }} style={{ borderRadius: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <SearchInput
            prefix={<SearchOutlined />}
            placeholder="Karta raqami, ijrochi, yuboruvchi yoki buyruq"
            aria-label="Qidirish: karta raqami, ijrochi, yuboruvchi yoki buyruq"
            value={filters.q}
            style={{ width: 320, maxWidth: '100%' }}
            onSearch={(value) => updateParams({ q: value })}
          />
          <SearchInput
            placeholder="MFO"
            aria-label="MFO"
            value={filters.mfo}
            style={{ width: 110 }}
            maxLength={10}
            onSearch={(value) => updateParams({ mfo: value })}
          />
          <Select
            allowClear
            placeholder="Cheklov turi"
            aria-label="Cheklov turi"
            style={{ width: 150 }}
            value={filters.restrictionType}
            onChange={(v) => updateParams({ restrictionType: v })}
            options={toOptions(cardRestrictionLabels)}
          />
          <Select
            allowClear
            placeholder="Asos"
            aria-label="Asos"
            style={{ width: 200 }}
            value={filters.basisCategory}
            onChange={(v) => updateParams({ basisCategory: v })}
            options={toOptions(cardBasisLabels)}
          />
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Ijrochi"
            aria-label="Ijrochi"
            style={{ width: 260, maxWidth: '100%' }}
            loading={isLoadingExecutors}
            value={filters.executorId}
            onChange={(v: number | undefined) =>
              updateParams({ executorId: v === undefined ? undefined : String(v) })
            }
            options={executors.map((e) => ({ value: e.id, label: formatExecutor(e) }))}
          />
          <DatePicker.RangePicker
            format="DD.MM.YYYY"
            placeholder={['Sana dan', 'Sana gacha']}
            allowEmpty={[true, true]}
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
            loading={isLoading || (isFetching && isPlaceholderData)}
            columns={columns}
            dataSource={data?.content ?? []}
            scroll={{ x: 'max-content' }}
            onRow={(record) => ({
              onClick: () => navigate(`/cards/${record.id}`),
              style: { cursor: 'pointer' },
            })}
            locale={{
              emptyText: (
                <EmptyState
                  description={hasFilters ? "Filtr bo'yicha karta topilmadi" : "Kartalar hali yo'q"}
                />
              ),
            }}
            pagination={{
              current: page + 1,
              pageSize: PAGE_SIZE,
              total: data?.page.totalElements ?? 0,
              onChange: (next) => updateParams({ page: String(next - 1) }),
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
