import { useQuery } from '@tanstack/react-query';
import { executorsApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';

export function useExecutors() {
  return useQuery({
    queryKey: queryKeys.executors.all,
    queryFn: () => executorsApi.list(),
    staleTime: 5 * 60_000,
  });
}
