import { useMutation } from '@tanstack/react-query';
import { notifyError } from '@/shared/api/errorHandler';
import { cardsApi } from '@/shared/api/endpoints';
import type { CardsFilters } from '@/shared/api/types';
import { downloadBlob, todayStamp } from '@/shared/ui/downloadBlob';

export function useExportCards(fileLabel: string) {
  return useMutation({
    mutationFn: async (filters: CardsFilters) => {
      const blob = await cardsApi.export({ ...filters, page: undefined, size: undefined });
      downloadBlob(blob, `kartalar-${fileLabel}-${todayStamp()}.xlsx`);
    },
    onError: (error) => notifyError(error, 'Excel faylni yuklab bo\'lmadi'),
  });
}
