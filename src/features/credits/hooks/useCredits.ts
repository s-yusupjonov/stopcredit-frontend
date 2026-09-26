import { useQuery } from '@tanstack/react-query';
import { creditsApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type { CreditsFilters } from '@/shared/api/types';

export function useCredits(filters: CreditsFilters) {
  return useQuery({
    queryKey: queryKeys.credits.list(filters),
    queryFn: () => creditsApi.list(filters),
    placeholderData: (prev) => prev,
  });
}
