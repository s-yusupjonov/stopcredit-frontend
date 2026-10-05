import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Descriptions, Skeleton, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, EditOutlined, UnlockOutlined } from '@ant-design/icons';
import { CardStatusTag } from '@/shared/ui/CardStatusTag';
import {
  formatCardNumber,
  formatDate,
  formatDateShort,
  formatExecutor,
  formatMoney,
} from '@/shared/ui/formatters';
import { cardBasisLabels, cardRestrictionLabels } from '@/shared/ui/strings';
import { useAuth } from '@/features/auth/useAuth';
import { useCard } from './hooks/useCard';
import { CardDocumentsSection } from './CardDocumentsSection';
import { UnblockCardModal } from './UnblockCardModal';

export function CardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const cardId = Number(id);
  const navigate = useNavigate();
  const { role } = useAuth();
  const { data: card, isLoading } = useCard(cardId);
  const [isUnblockOpen, setIsUnblockOpen] = useState(false);

  if (isLoading || !card) {
    return (
      <Card style={{ borderRadius: 12 }}>
        <Skeleton active />
      </Card>
    );
  }

  const canManage = role === 'ANTI_FRAUD';
  const canUnblock = canManage && card.status === 'BLOCKED';
  const listPath = card.status === 'BLOCKED' ? '/cards/blocked' : '/cards/active';

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {formatCardNumber(card.cardNumber)}
            </Typography.Title>
            <CardStatusTag status={card.status} />
          </div>
          <Typography.Text type="secondary">Karta tafsilotlari</Typography.Text>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(listPath)}>
            Ro'yxatga qaytish
          </Button>
          {canUnblock && (
            <Button icon={<UnlockOutlined />} onClick={() => setIsUnblockOpen(true)}>
              Blokdan ochish
            </Button>
          )}
          {canManage && (
            <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/cards/${card.id}/edit`)}>
              Tahrirlash
            </Button>
          )}
        </div>
      </div>

      <Card title="Ma'lumotlar" style={{ borderRadius: 12 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="T/r">{card.id}</Descriptions.Item>
          <Descriptions.Item label="Karta raqami">{formatCardNumber(card.cardNumber)}</Descriptions.Item>
          <Descriptions.Item label="MFO">{card.mfo ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Sana">{formatDateShort(card.restrictionDate)}</Descriptions.Item>
          <Descriptions.Item label="Karta balansi">
            {typeof card.balance === 'number' ? formatMoney(card.balance) : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Cheklov turi">
            {card.restrictionType ? cardRestrictionLabels[card.restrictionType] : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Asos">
            <Tag>{cardBasisLabels[card.basisCategory]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Buyruq raqami">{card.basisComment ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <CardStatusTag status={card.status} />
          </Descriptions.Item>
          <Descriptions.Item label="Eslatma">{card.statusComment ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Ijrochi" span={2}>
            {formatExecutor(card.executor)}
          </Descriptions.Item>
          <Descriptions.Item label="Yuboruvchi">{card.senderName}</Descriptions.Item>
          <Descriptions.Item label="Yaratilgan sana">{formatDate(card.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="Yangilangan sana" span={2}>
            {formatDate(card.updatedAt)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {card.unblockedAt && (
        <Card title="Blokdan ochish" style={{ borderRadius: 12, marginTop: 16 }}>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Buyruq raqami">{card.unblockOrderNumber ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Ochilgan sana">{formatDate(card.unblockedAt)}</Descriptions.Item>
            <Descriptions.Item label="Ochgan xodim">{card.unblockedBy ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Eslatma">{card.unblockComment ?? '—'}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <CardDocumentsSection card={card} canManage={canManage} />

      <UnblockCardModal
        card={isUnblockOpen ? card : null}
        onClose={() => setIsUnblockOpen(false)}
      />
    </div>
  );
}