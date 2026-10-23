import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { usersApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';

export const AD_SEARCH_MIN_LENGTH = 2;

/** Searches Active Directory by full name (or login prefix). Idle until the text is long enough. */
export function useAdSearch(text: string) {
  const q = text.trim();
  return useQuery({
    queryKey: queryKeys.users.adSearch(q),
    queryFn: () => usersApi.adSearch(q),
    enabled: q.length >= AD_SEARCH_MIN_LENGTH,
    retry: false,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
