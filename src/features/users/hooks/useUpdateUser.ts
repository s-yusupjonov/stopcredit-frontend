import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type { UserUpdateRequest } from '@/shared/api/types';

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UserUpdateRequest }) =>
      usersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
