import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/shared/api/endpoints';
import { notifyError } from '@/shared/api/errorHandler';
import { queryKeys } from '@/shared/api/queryKeys';

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onError: (error) => notifyError(error, 'Foydalanuvchini o\'chirib bo\'lmadi'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
