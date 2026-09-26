import { useQuery } from '@tanstack/react-query';
import { creditsApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';

export function useCredit(id: number) {
  return useQuery({
    queryKey: queryKeys.credits.detail(id),
    queryFn: () => creditsApi.get(id),
    enabled: Number.isFinite(id),
  });
}
