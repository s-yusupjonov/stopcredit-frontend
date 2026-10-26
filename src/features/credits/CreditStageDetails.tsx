import { Skeleton } from 'antd';
import { QueryErrorState } from '@/shared/ui/QueryErrorState';
import { StageFlow } from '@/shared/ui/StageFlow';
import { useCredit } from './hooks/useCredit';

interface CreditStageDetailsProps {
  id: number;
}

export function CreditStageDetails({ id }: CreditStageDetailsProps) {
  const { data, isLoading, isError, error, refetch } = useCredit(id, { live: true });

  if (isLoading) return <Skeleton active paragraph={{ rows: 3 }} />;
  if (isError || !data) return <QueryErrorState bare error={error} onRetry={() => void refetch()} />;

  return (
    <div style={{ overflowX: 'auto' }}>
      <StageFlow
        currentStage={data.stage}
        deadline={data.stageDeadline}
        danger={data.danger}
        createdAt={data.createdAt}
        history={data.stageHistory ?? null}
      />
    </div>
  );
}
