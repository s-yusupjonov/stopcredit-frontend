import { useMutation, useQueryClient } from '@tanstack/react-query';
import { creditsApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type { CreditRequest } from '@/shared/api/types';

export function useCreateCredit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreditRequest) => creditsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credits.all });
    },
  });
}
