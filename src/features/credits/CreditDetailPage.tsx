import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  Descriptions,
  Modal,
  Segmented,
  Skeleton,
  Tooltip,
  Typography,
  notification,
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { StatusTag } from '@/shared/ui/StatusTag';
import { StageTracker } from '@/shared/ui/StageTracker';
import { QueryErrorState } from '@/shared/ui/QueryErrorState';
import { formatMoney, formatDate } from '@/shared/ui/formatters';
import { typeLabels } from '@/shared/ui/strings';
import { notifyError } from '@/shared/api/errorHandler';
import type { CreditStatus } from '@/shared/api/types';
import { useAuth } from '@/features/auth/useAuth';
import { useCredit } from './hooks/useCredit';
import { useAdvanceCredit } from './hooks/useAdvanceCredit';
import { useUpdateStatus } from './hooks/useUpdateStatus';
import { DocumentsSection } from './DocumentsSection';

const stageOwner: Record<string, string> = {
  ANTI_FRAUD: 'ANTI_FRAUD',
  CREDIT_MANAGEMENT: 'CREDIT_MANAGEMENT',
  LEGAL: 'LEGAL',
  UNDERWRITING: 'UNDERWRITING',
};

export function CreditDetailPage() {
  const { id } = useParams<{ id: string }>();
  const creditId = Number(id);
  const navigate = useNavigate();
  const { role } = useAuth();
  const { data: credit, isLoading, isError, error, refetch } = useCredit(creditId, { live: true });
  const advanceMutation = useAdvanceCredit(creditId);
  const updateStatusMutation = useUpdateStatus(creditId);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isError && !credit) {
    return <QueryErrorState error={error} onRetry={() => void refetch()} />;
  }

  if (isLoading || !credit) {
    return (
      <Card style={{ borderRadius: 12 }}>
        <Skeleton active />
      </Card>
    );
  }

  const isOwningDepartment = role !== null && stageOwner[credit.stage] === role;
  const hasDocsAtCurrentStage = (credit.documents ?? []).some((d) => d.stage === credit.stage);
  const canAdvance = isOwningDepartment && hasDocsAtCurrentStage && credit.stage !== 'COMPLETED';
  const isLastStage = credit.stage === 'UNDERWRITING';

  const handleAdvance = async () => {
    try {
      await advanceMutation.mutateAsync();
      notification.success({ message: 'Muvaffaqiyatli yuborildi' });
      setConfirmOpen(false);
    } catch (error) {
      notifyError(error);
      setConfirmOpen(false);
    }
  };

  const handleStatusChange = async (status: CreditStatus) => {
    if (status === credit.status) return;
    try {
      await updateStatusMutation.mutateAsync(status);
      notification.success({ message: 'Status yangilandi' });
    } catch (error) {
      notifyError(error);
    }
  };

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
              {credit.applicationNumber} — {credit.lastName} {credit.firstName}
            </Typography.Title>
            <StatusTag status={credit.status} />
          </div>
          <Typography.Text type="secondary">Kredit tafsilotlari</Typography.Text>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {role === 'ANTI_FRAUD' && credit.stage === 'ANTI_FRAUD' && (
            <Button icon={<EditOutlined />} onClick={() => navigate(`/credits/${credit.id}/edit`)}>
              Tahrirlash
            </Button>
          )}

          {role === 'CREDIT_MANAGEMENT' && (
            <Segmented
              value={credit.status}
              onChange={(v) => handleStatusChange(v as CreditStatus)}
              options={[
                { label: 'Faol', value: 'ACTIVE' },
                { label: "To'xtatilgan", value: 'STOPPED' },
              ]}
              disabled={updateStatusMutation.isPending}
            />
          )}

          {isOwningDepartment && credit.stage !== 'COMPLETED' && (
            <Tooltip
              title={
                !hasDocsAtCurrentStage
                  ? 'Davom etish uchun kamida bitta hujjat yuklang'
                  : undefined
              }
            >
              <Button
                type="primary"
                disabled={!canAdvance}
                onClick={() => setConfirmOpen(true)}
              >
                {isLastStage ? 'Yakunlash' : 'Keyingi bosqichga yuborish'}
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <StageTracker
          currentStage={credit.stage}
          deadline={credit.stageDeadline}
          danger={credit.danger}
        />
      </Card>

      <Card title="Ma'lumotlar" style={{ borderRadius: 12 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Familiya">{credit.lastName}</Descriptions.Item>
          <Descriptions.Item label="Ism">{credit.firstName}</Descriptions.Item>
          <Descriptions.Item label="Sharif">{credit.middleName ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="PINFL">{credit.pinfl}</Descriptions.Item>
          <Descriptions.Item label="Kredit turi">{typeLabels[credit.type]}</Descriptions.Item>
          <Descriptions.Item label="MFO">{credit.mfo}</Descriptions.Item>
          <Descriptions.Item label="Ariza raqami">{credit.applicationNumber}</Descriptions.Item>
          <Descriptions.Item label="Summa">{formatMoney(credit.amount)}</Descriptions.Item>
          <Descriptions.Item label="Yaratdi">{credit.createdBy}</Descriptions.Item>
          <Descriptions.Item label="Yaratilgan sana">{formatDate(credit.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="Yangilangan sana" span={2}>
            {formatDate(credit.updatedAt)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <DocumentsSection credit={credit} canManageCurrentStage={isOwningDepartment} />

      <Modal
        title={isLastStage ? "Kreditni yakunlashni tasdiqlaysizmi?" : 'Keyingi bosqichga yuborishni tasdiqlaysizmi?'}
        open={confirmOpen}
        onOk={handleAdvance}
        onCancel={() => setConfirmOpen(false)}
        confirmLoading={advanceMutation.isPending}
        okText="Tasdiqlash"
        cancelText="Bekor qilish"
      >
        <p>Bu amalni ortga qaytarib bo'lmaydi.</p>
      </Modal>
    </div>
  );
}
