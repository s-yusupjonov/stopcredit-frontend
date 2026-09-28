import { useQuery } from '@tanstack/react-query';
import { cardsApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';

export function useCard(id: number) {
  return useQuery({
    queryKey: queryKeys.cards.detail(id),
    queryFn: () => cardsApi.get(id),
    enabled: Number.isFinite(id),
  });
}
