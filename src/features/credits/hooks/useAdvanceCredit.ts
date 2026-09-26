import { useMutation, useQueryClient } from '@tanstack/react-query';
import { creditsApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';

export function useAdvanceCredit(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => creditsApi.advance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.credits.detail(id) });
    },
  });
}
