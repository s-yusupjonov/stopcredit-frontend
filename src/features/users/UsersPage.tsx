import { useMemo, useState } from 'react';
import { Button, Card, Input, Segmented, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import type { Role, UserResponse } from '@/shared/api/types';
import { EmptyState } from '@/shared/ui/EmptyState';
import { QueryErrorState } from '@/shared/ui/QueryErrorState';
import { PageHeader } from '@/shared/ui/PageHeader';
import { formatDate } from '@/shared/ui/formatters';
import { roleLabels } from '@/shared/ui/strings';
import { colors } from '@/shared/theme';
import { useUsers } from './hooks/useUsers';
import { UserFormModal } from './UserFormModal';

type StatusFilter = 'all' | 'active' | 'inactive';

export function UsersPage() {
  const { data: users, isLoading, isError, error, refetch } = useUsers();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const visibleUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (users ?? []).filter((user) => {
      if (statusFilter === 'active' && !user.active) return false;
      if (statusFilter === 'inactive' && user.active) return false;
      return (
        !needle ||
        user.username.toLowerCase().includes(needle) ||
        user.fullName.toLowerCase().includes(needle)
      );
    });
  }, [users, query, statusFilter]);

  const pendingCount = (users ?? []).filter((u) => !u.active).length;

  function openCreate() {
    setEditingUser(null);
    setModalOpen(true);
  }

  function openEdit(user: UserResponse) {
    setEditingUser(user);
    setModalOpen(true);
  }

  const columns: ColumnsType<UserResponse> = [
    { title: 'Login', dataIndex: 'username', key: 'username' },
    { title: 'F.I.Sh.', dataIndex: 'fullName', key: 'fullName' },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (v: Role) => <Tag style={{ borderRadius: 999 }}>{roleLabels[v]}</Tag>,
    },
    {
      title: 'Holat',
      dataIndex: 'active',
      key: 'active',
      render: (v: boolean, record) =>
        v ? (
          <Tag color="green" style={{ borderRadius: 999 }}>
            Faol
          </Tag>
        ) : (
          <Tag color={record.authSource === 'AD' ? 'orange' : 'default'} style={{ borderRadius: 999 }}>
            {record.authSource === 'AD' ? 'Tasdiq kutilmoqda' : 'Nofaol'}
          </Tag>
        ),
    },
    {
      title: 'Baza',
      dataIndex: 'authSource',
      key: 'authSource',
      render: (v: UserResponse['authSource']) => (
        <Tag color={v === 'AD' ? 'blue' : 'default'} style={{ borderRadius: 999 }}>
          {v === 'AD' ? 'AD' : 'Lokal'}
        </Tag>
      ),
    },
    {
      title: 'Yaratilgan',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => <span style={{ whiteSpace: 'nowrap' }}>{formatDate(v)}</span>,
    },
    {
      title: 'Amal',
      key: 'actions',
      width: 70,
      render: (_, record) => (
        <Tooltip title="Tahrirlash">
          <Button
            type="text"
            icon={<EditOutlined />}
            aria-label={`${record.username} foydalanuvchisini tahrirlash`}
            onClick={() => openEdit(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Foydalanuvchilar"
        subtitle="Tizim foydalanuvchilarini boshqarish"
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Yangi foydalanuvchi
          </Button>
        }
      />

      <Card styles={{ body: { padding: 20 } }} style={{ borderRadius: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Login yoki F.I.Sh."
            aria-label="Qidirish: login yoki F.I.Sh."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: 280, maxWidth: '100%' }}
          />
          <Segmented<StatusFilter>
            aria-label="Holat bo'yicha filtr"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'Barchasi', value: 'all' },
              { label: 'Faol', value: 'active' },
              { label: `Nofaol${pendingCount > 0 ? ` (${pendingCount})` : ''}`, value: 'inactive' },
            ]}
          />
        </div>
      </Card>

      <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}>
        {isError && !users ? (
          <QueryErrorState bare error={error} onRetry={() => void refetch()} />
        ) : (
          <Table
            rowKey="id"
            loading={isLoading}
            columns={columns}
            dataSource={visibleUsers}
            scroll={{ x: 'max-content' }}
            pagination={visibleUsers.length > 20 ? { pageSize: 20, showSizeChanger: false } : false}
            locale={{
              emptyText: (
                <EmptyState
                  description={query || statusFilter !== 'all' ? 'Mos foydalanuvchi topilmadi' : undefined}
                />
              ),
            }}
            onRow={(record) => ({
              style: { background: !record.active ? colors.bg : undefined },
            })}
          />
        )}
      </Card>

      <UserFormModal open={modalOpen} onClose={() => setModalOpen(false)} editingUser={editingUser} />
    </div>
  );
}
