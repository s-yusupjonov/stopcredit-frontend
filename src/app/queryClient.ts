import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

/** Sessiya chegarasida (login/logout/401) eski foydalanuvchi ma'lumoti qolmasligi uchun. */
export function resetQueryCache() {
  void queryClient.cancelQueries();
  queryClient.clear();
}
