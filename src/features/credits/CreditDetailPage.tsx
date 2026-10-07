import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Modal, Segmented, Skeleton, Tooltip } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { StatusTag } from '@/shared/ui/StatusTag';
import { StageTracker } from '@/shared/ui/StageTracker';
import { QueryErrorState } from '@/shared/ui/QueryErrorState';
import { PageHeader } from '@/shared/ui/PageHeader';
import { DetailsTable } from '@/shared/ui/DetailsTable';
import { confirmAction, feedback } from '@/shared/ui/feedback';
import { formatMoney, formatDate } from '@/shared/ui/formatters';
import { stageLabels, stageOrder, statusLabels, typeLabels } from '@/shared/ui/strings';
import { useBackNavigation } from '@/shared/ui/useBackNavigation';
import { notifyError } from '@/shared/api/errorHandler';
import type { CreditStage, CreditStatus, Role } from '@/shared/api/types';
import { useAuth } from '@/features/auth/useAuth';
import { useCredit } from './hooks/useCredit';
import { useAdvanceCredit } from './hooks/useAdvanceCredit';
import { useUpdateStatus } from './hooks/useUpdateStatus';
import { DocumentsSection } from './DocumentsSection';

const stageOwner: Record<CreditStage, Role | null> = {
  ANTI_FRAUD: 'ANTI_FRAUD',
  CREDIT_MANAGEMENT: 'CREDIT_MANAGEMENT',
  LEGAL: 'LEGAL',
  UNDERWRITING: 'UNDERWRITING',
  COMPLETED: null,
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
  const goBack = useBackNavigation('/credits');

  const backButton = (
    <Button type="link" icon={<ArrowLeftOutlined />} style={{ padding: 0 }} onClick={goBack}>
      Orqaga
    </Button>
  );

  if (!Number.isInteger(creditId) || creditId <= 0) {
    return <QueryErrorState error={{ response: { status: 404 } }} />;
  }

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
  const canAdvance = isOwningDepartment && hasDocsAtCurrentStage;
  const isLastStage = credit.stage === 'UNDERWRITING';
  const nextStageLabel = isLastStage ? null : stageLabels[nextStage(credit.stage)];

  const handleAdvance = async () => {
    try {
      await advanceMutation.mutateAsync();
      feedback.message.success(isLastStage ? 'Kredit yakunlandi' : `Kredit "${nextStageLabel}" bosqichiga yuborildi`);
    } catch (advanceError) {
      notifyError(advanceError);
    } finally {
      setConfirmOpen(false);
    }
  };

  const handleStatusChange = async (status: CreditStatus) => {
    if (status === credit.status) return;
    const confirmed = await confirmAction({
      title: `Kredit statusini "${statusLabels[status]}" ga o'zgartirasizmi?`,
      content: `${credit.applicationNumber} — ${credit.lastName} ${credit.firstName}`,
      okText: "O'zgartirish",
      danger: status === 'STOPPED',
    });
    if (!confirmed) return;
    try {
      await updateStatusMutation.mutateAsync(status);
      feedback.message.success('Status yangilandi');
    } catch (statusError) {
      notifyError(statusError);
    }
  };

  return (
    <div>
      <PageHeader
        back={backButton}
        title={`${credit.applicationNumber} — ${credit.lastName} ${credit.firstName}`}
        tags={<StatusTag status={credit.status} />}
        subtitle="Kredit tafsilotlari"
        actions={
          <>
            {role === 'ANTI_FRAUD' && credit.stage === 'ANTI_FRAUD' && (
              <Button icon={<EditOutlined />} onClick={() => navigate(`/credits/${credit.id}/edit`)}>
                Tahrirlash
              </Button>
            )}

            {role === 'CREDIT_MANAGEMENT' && (
              <Tooltip title="Kredit statusini o'zgartirish">
                <Segmented
                  aria-label="Kredit statusi"
                  value={credit.status}
                  onChange={(v) => void handleStatusChange(v as CreditStatus)}
                  options={[
                    { label: statusLabels.ACTIVE, value: 'ACTIVE' },
                    { label: statusLabels.STOPPED, value: 'STOPPED' },
                  ]}
                  disabled={updateStatusMutation.isPending}
                />
              </Tooltip>
            )}

            {isOwningDepartment && (
              <Tooltip
                title={!hasDocsAtCurrentStage ? 'Davom etish uchun kamida bitta hujjat yuklang' : undefined}
              >
                <Button type="primary" disabled={!canAdvance} onClick={() => setConfirmOpen(true)}>
                  {isLastStage ? 'Yakunlash' : 'Keyingi bosqichga yuborish'}
                </Button>
              </Tooltip>
            )}
          </>
        }
      />

      <Card style={{ borderRadius: 12, marginBottom: 16 }} styles={{ body: { overflowX: 'auto' } }}>
        <StageTracker
          currentStage={credit.stage}
          deadline={credit.stageDeadline}
          danger={credit.danger}
        />
      </Card>

      <Card title="Ma'lumotlar" style={{ borderRadius: 12 }}>
        <DetailsTable
          caption="Kredit ma'lumotlari"
          items={[
            { label: 'Familiya', value: credit.lastName },
            { label: 'Ism', value: credit.firstName },
            { label: 'Sharif', value: credit.middleName },
            { label: 'PINFL', value: credit.pinfl },
            { label: 'Kredit turi', value: typeLabels[credit.type] },
            { label: 'MFO', value: credit.mfo },
            { label: 'Ariza raqami', value: credit.applicationNumber },
            { label: 'Summa', value: formatMoney(credit.amount), strong: true },
            { label: 'Yaratdi', value: credit.createdBy },
            { label: 'Bosqich', value: stageLabels[credit.stage] },
            { label: 'Yaratilgan sana', value: formatDate(credit.createdAt) },
            { label: 'Yangilangan sana', value: formatDate(credit.updatedAt) },
          ]}
        />
      </Card>

      <DocumentsSection credit={credit} canManageCurrentStage={isOwningDepartment} />

      <Modal
        title={isLastStage ? 'Kreditni yakunlashni tasdiqlaysizmi?' : 'Keyingi bosqichga yuborishni tasdiqlaysizmi?'}
        open={confirmOpen}
        onOk={() => void handleAdvance()}
        onCancel={() => setConfirmOpen(false)}
        confirmLoading={advanceMutation.isPending}
        okText="Tasdiqlash"
        cancelText="Bekor qilish"
      >
        <p>
          {isLastStage
            ? 'Kredit yakunlangan holatga o\'tadi.'
            : `Kredit "${nextStageLabel}" bo'limiga yuboriladi va siz uni boshqa tahrirlay olmaysiz.`}{' '}
          Bu amalni ortga qaytarib bo'lmaydi.
        </p>
      </Modal>
    </div>
  );
}

function nextStage(stage: CreditStage): CreditStage {
  return stageOrder[Math.min(stageOrder.indexOf(stage) + 1, stageOrder.length - 1)];
}
