import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import { queryClient } from '@/app/queryClient';
import { useAuthStore } from './authStore';

const SYNC_INTERVAL_MS = 60_000;

/**
 * Serverdagi foydalanuvchi (rol, faollik, F.I.Sh.) bilan localStorage snapshotini
 * sinxronlab turadi. Rol o'zgarsa menyu va tugmalar sahifani yangilamasdan almashadi.
 */
export function useSessionSync() {
  const token = useAuthStore((s) => s.token);
  const localUser = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const { data } = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => authApi.me(),
    enabled: !!token,
    staleTime: 0,
    refetchInterval: SYNC_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!data || !localUser) return;
    const changed =
      data.role !== localUser.role ||
      data.fullName !== localUser.fullName ||
      data.active !== localUser.active ||
      data.username !== localUser.username;
    if (!changed) return;
    const roleChanged = data.role !== localUser.role;
    updateUser(data);
    if (roleChanged) {
      // Rol o'zgargan: eski rolga ko'rinadigan ro'yxat/detal cache'i yaroqsiz.
      void queryClient.resetQueries({
        predicate: (q) => q.queryKey[0] !== queryKeys.auth.me[0],
      });
    }
  }, [data, localUser, updateUser]);
}
