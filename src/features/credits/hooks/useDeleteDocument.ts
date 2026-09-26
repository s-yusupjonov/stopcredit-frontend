import { useMutation, useQueryClient } from '@tanstack/react-query';
import { creditsApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';

export function useDeleteDocument(creditId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (docId: number) => creditsApi.deleteDocument(creditId, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credits.detail(creditId) });
    },
  });
}
