import { useState } from 'react';
import { Button, Card, Switch, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import type { UserResponse } from '@/shared/api/types';
import { EmptyState } from '@/shared/ui/EmptyState';
import { QueryErrorState } from '@/shared/ui/QueryErrorState';
import { formatDate } from '@/shared/ui/formatters';
import { roleLabels } from '@/shared/ui/strings';
import { colors } from '@/shared/theme';
import { useUsers } from './hooks/useUsers';
import { UserFormModal } from './UserFormModal';

export function UsersPage() {
  const { data: users, isLoading, isError, error, refetch } = useUsers();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);

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
      render: (v) => <Tag style={{ borderRadius: 999 }}>{roleLabels[v as keyof typeof roleLabels]}</Tag>,
    },
    {
      title: 'Faol',
      dataIndex: 'active',
      key: 'active',
      render: (v: boolean) => (
        <Switch checked={v} disabled size="small" />
      ),
    },
    {
      title: 'Baza',
      dataIndex: 'authSource',
      key: 'authSource',
      render: (v: 'LOCAL' | 'AD', record) => (
        <Tag color={v === 'AD' ? 'blue' : 'default'} style={{ borderRadius: 999 }}>
          {v === 'AD' ? 'AD' : 'Lokal'}
          {v === 'AD' && !record.active ? ' · tasdiq kutilmoqda' : ''}
        </Tag>
      ),
    },
    { title: 'Yaratilgan', dataIndex: 'createdAt', key: 'createdAt', render: formatDate },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
      ),
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
            Foydalanuvchilar
          </Typography.Title>
          <Typography.Text type="secondary">Tizim foydalanuvchilarini boshqarish</Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Yangi foydalanuvchi
        </Button>
      </div>

      <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}>
        {isError ? (
          <QueryErrorState bare error={error} onRetry={() => void refetch()} />
        ) : (
        <Table
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={users ?? []}
          pagination={false}
          locale={{ emptyText: <EmptyState /> }}
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