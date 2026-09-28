import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type { CardRequest } from '@/shared/api/types';

export function useUpdateCard(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CardRequest) => cardsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
    },
  });
}
