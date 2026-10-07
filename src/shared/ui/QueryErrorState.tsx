import { Button, Card, Result } from 'antd';
import { getErrorStatus, isNetworkError } from '@/shared/api/errorHandler';

interface QueryErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  /** Jadval ichida ko'rsatilsa Card o'rami kerak emas. */
  bare?: boolean;
}

export function QueryErrorState({ error, onRetry, bare }: QueryErrorStateProps) {
  const status = getErrorStatus(error);
  const network = isNetworkError(error);

  let resultStatus: '403' | '404' | '500' | 'error' = 'error';
  let title = 'Ma\'lumotni yuklab bo\'lmadi';
  let subTitle = 'Qayta urinib ko\'ring.';

  if (network) {
    title = "Server bilan aloqa yo'q";
    subTitle = 'Internet ulanishini tekshiring va qayta urinib ko\'ring.';
  } else if (status === 403) {
    resultStatus = '403';
    title = "Ruxsat yo'q";
    subTitle = "Sizda bu ma'lumotni ko'rish huquqi yo'q.";
  } else if (status === 404) {
    resultStatus = '404';
    title = 'Topilmadi';
    subTitle = "So'ralgan yozuv mavjud emas yoki o'chirilgan.";
  } else if (status !== undefined && status >= 500) {
    resultStatus = '500';
    title = 'Server xatosi';
    subTitle = 'Keyinroq qayta urinib ko\'ring.';
  }

  const showRetry = !!onRetry && status !== 403 && status !== 404;
  const content = (
    <Result
      status={resultStatus}
      title={title}
      subTitle={subTitle}
      extra={
        showRetry ? (
          <Button type="primary" onClick={onRetry}>
            Qayta urinish
          </Button>
        ) : undefined
      }
    />
  );

  return bare ? content : <Card style={{ borderRadius: 12 }}>{content}</Card>;
}
