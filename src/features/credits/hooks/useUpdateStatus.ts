import { useMutation, useQueryClient } from '@tanstack/react-query';
import { creditsApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type { CreditStatus } from '@/shared/api/types';

export function useUpdateStatus(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: CreditStatus) => creditsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.credits.detail(id) });
    },
  });
}
