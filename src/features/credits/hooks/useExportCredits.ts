import { useMutation } from '@tanstack/react-query';
import { notifyError } from '@/shared/api/errorHandler';
import { creditsApi } from '@/shared/api/endpoints';
import type { CreditsFilters } from '@/shared/api/types';
import { downloadBlob, todayStamp } from '@/shared/ui/downloadBlob';

export function useExportCredits() {
  return useMutation({
    mutationFn: async (filters: CreditsFilters) => {
      const blob = await creditsApi.export({ ...filters, page: undefined, size: undefined });
      downloadBlob(blob, `kreditlar-${todayStamp()}.xlsx`);
    },
    onError: (error) => notifyError(error, 'Excel faylni yuklab bo\'lmadi'),
  });
}
