import { useMutation } from '@tanstack/react-query';
import { usersApi } from '@/shared/api/endpoints';

export function useAdLookup() {
  return useMutation({
    mutationFn: (username: string) => usersApi.adLookup(username),
  });
}