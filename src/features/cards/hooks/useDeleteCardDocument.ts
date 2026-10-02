import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';

export function useDeleteCardDocument(cardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (docId: number) => cardsApi.deleteDocument(cardId, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.detail(cardId) });
    },
  });
}
