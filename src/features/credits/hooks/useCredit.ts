import { useQuery } from '@tanstack/react-query';
import { creditsApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';

/** live=true: muddat/holat o'zgarishlarini ko'rsatish uchun davriy yangilanadi (forma uchun emas). */
export function useCredit(id: number, options?: { live?: boolean }) {
  return useQuery({
    queryKey: queryKeys.credits.detail(id),
    queryFn: () => creditsApi.get(id),
    enabled: Number.isFinite(id),
    refetchInterval: options?.live ? 60_000 : false,
  });
}
