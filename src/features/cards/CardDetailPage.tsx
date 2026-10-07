import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Skeleton, Tag } from 'antd';
import { ArrowLeftOutlined, EditOutlined, UnlockOutlined } from '@ant-design/icons';
import { CardStatusTag } from '@/shared/ui/CardStatusTag';
import { QueryErrorState } from '@/shared/ui/QueryErrorState';
import { PageHeader } from '@/shared/ui/PageHeader';
import { DetailsTable } from '@/shared/ui/DetailsTable';
import { useBackNavigation } from '@/shared/ui/useBackNavigation';
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
  const { data: card, isLoading, isError, error, refetch } = useCard(cardId);
  const [isUnblockOpen, setIsUnblockOpen] = useState(false);
  const goBack = useBackNavigation(card?.status === 'ACTIVE' ? '/cards/active' : '/cards/blocked');

  if (!Number.isInteger(cardId) || cardId <= 0) {
    return <QueryErrorState error={{ response: { status: 404 } }} />;
  }

  if (isError && !card) {
    return <QueryErrorState error={error} onRetry={() => void refetch()} />;
  }

  if (isLoading || !card) {
    return (
      <Card style={{ borderRadius: 12 }}>
        <Skeleton active />
      </Card>
    );
  }

  const canManage = role === 'ANTI_FRAUD';
  const canUnblock = canManage && card.status === 'BLOCKED';

  return (
    <div>
      <PageHeader
        back={
          <Button type="link" icon={<ArrowLeftOutlined />} style={{ padding: 0 }} onClick={goBack}>
            Ro'yxatga qaytish
          </Button>
        }
        title={formatCardNumber(card.cardNumber)}
        tags={<CardStatusTag status={card.status} />}
        subtitle="Karta tafsilotlari"
        actions={
          <>
            {canUnblock && (
              <Button icon={<UnlockOutlined />} onClick={() => setIsUnblockOpen(true)}>
                Blokdan ochish
              </Button>
            )}
            {canManage && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/cards/${card.id}/edit`)}
              >
                Tahrirlash
              </Button>
            )}
          </>
        }
      />

      <Card title="Ma'lumotlar" style={{ borderRadius: 12 }}>
        <DetailsTable
          caption="Karta ma'lumotlari"
          items={[
            { label: 'T/r', value: card.id },
            { label: 'Karta raqami', value: formatCardNumber(card.cardNumber) },
            { label: 'Status', value: <CardStatusTag status={card.status} /> },
            {
              label: 'Karta balansi',
              value: card.balance === null ? null : formatMoney(card.balance),
              strong: true,
            },
            { label: 'MFO', value: card.mfo },
            { label: 'Sana', value: card.restrictionDate && formatDateShort(card.restrictionDate) },
            {
              label: 'Cheklov turi',
              value: card.restrictionType && cardRestrictionLabels[card.restrictionType],
            },
            { label: 'Asos', value: <Tag style={{ margin: 0 }}>{cardBasisLabels[card.basisCategory]}</Tag> },
            { label: 'Buyruq raqami', value: card.basisComment, wrap: true },
            { label: 'Eslatma', value: card.statusComment, wrap: true },
            { label: 'Ijrochi', value: formatExecutor(card.executor), wrap: true },
            { label: 'Yuboruvchi', value: card.senderName },
            { label: 'Yaratilgan sana', value: formatDate(card.createdAt) },
            { label: 'Yangilangan sana', value: formatDate(card.updatedAt) },
          ]}
        />
      </Card>

      {card.unblockedAt && (
        <Card title="Blokdan ochish" style={{ borderRadius: 12, marginTop: 16 }}>
          <DetailsTable
            caption="Blokdan ochish ma'lumotlari"
            items={[
              { label: 'Buyruq raqami', value: card.unblockOrderNumber, wrap: true },
              { label: 'Ochilgan sana', value: formatDate(card.unblockedAt) },
              { label: 'Ochgan xodim', value: card.unblockedBy },
              { label: 'Eslatma', value: card.unblockComment, wrap: true },
            ]}
          />
        </Card>
      )}

      <CardDocumentsSection card={card} canManage={canManage} />

      <UnblockCardModal card={isUnblockOpen ? card : null} onClose={() => setIsUnblockOpen(false)} />
    </div>
  );
}
