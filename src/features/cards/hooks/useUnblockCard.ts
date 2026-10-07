import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type { CardUnblockPayload } from '@/shared/api/types';

interface UnblockCardVariables extends CardUnblockPayload {
  id: number;
}

export function useUnblockCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: UnblockCardVariables) => cardsApi.unblock(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
    },
  });
}