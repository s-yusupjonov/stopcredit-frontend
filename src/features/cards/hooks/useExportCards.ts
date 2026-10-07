import { useMutation } from '@tanstack/react-query';
import { notifyError } from '@/shared/api/errorHandler';
import { cardsApi } from '@/shared/api/endpoints';
import type { CardsFilters } from '@/shared/api/types';

export function useExportCards(fileLabel: string) {
  return useMutation({
    mutationFn: async (filters: CardsFilters) => {
      const blob = await cardsApi.export({ ...filters, page: undefined, size: undefined });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `kartalar-${fileLabel}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    },
    onError: (error) => notifyError(error, 'Excel faylni yuklab bo\'lmadi'),
  });
}
