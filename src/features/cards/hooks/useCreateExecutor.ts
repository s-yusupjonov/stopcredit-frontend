import { useMutation, useQueryClient } from '@tanstack/react-query';
import { executorsApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type { ExecutorRequest } from '@/shared/api/types';

export function useCreateExecutor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ExecutorRequest) => executorsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.executors.all });
    },
  });
}
