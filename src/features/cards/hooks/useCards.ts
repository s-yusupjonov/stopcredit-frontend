import { useQuery } from '@tanstack/react-query';
import { cardsApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type { CardsFilters } from '@/shared/api/types';

export function useCards(filters: CardsFilters) {
  return useQuery({
    queryKey: queryKeys.cards.list(filters),
    queryFn: () => cardsApi.list(filters),
    placeholderData: (prev) => prev,
  });
}
