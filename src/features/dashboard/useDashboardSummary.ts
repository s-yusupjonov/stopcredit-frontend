import { useQuery } from '@tanstack/react-query';
import { creditsApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';

/** Server tomonidagi aggregate (barcha yozuvlar bo'yicha, rol ko'rish doirasida). */
export function useDashboardSummary(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.credits.summary,
    queryFn: () => creditsApi.summary(),
    enabled,
    refetchInterval: 60_000,
  });
}
