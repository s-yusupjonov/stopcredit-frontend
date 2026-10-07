import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsApi } from '@/shared/api/endpoints';
import { notifyError } from '@/shared/api/errorHandler';
import { queryKeys } from '@/shared/api/queryKeys';

export function useDeleteCardDocument(cardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (docId: number) => cardsApi.deleteDocument(cardId, docId),
    onError: (error) => notifyError(error, 'Hujjatni o\'chirib bo\'lmadi'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.detail(cardId) });
    },
  });
}
