import { useMutation, useQueryClient } from '@tanstack/react-query';
import { creditsApi } from '@/shared/api/endpoints';
import { notifyError } from '@/shared/api/errorHandler';
import { queryKeys } from '@/shared/api/queryKeys';

export function useDeleteDocument(creditId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (docId: number) => creditsApi.deleteDocument(creditId, docId),
    onError: (error) => notifyError(error, 'Hujjatni o\'chirib bo\'lmadi'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credits.detail(creditId) });
    },
  });
}
