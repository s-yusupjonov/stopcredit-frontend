import { useQuery } from '@tanstack/react-query';
import { creditsApi } from '@/shared/api/endpoints';
import { useAuth } from '@/features/auth/useAuth';

const SUMMARY_PAGE_SIZE = 200;

export function useDashboardSummary() {
  const { role } = useAuth();
  return useQuery({
    queryKey: ['credits', 'dashboard-summary'],
    queryFn: () => creditsApi.list({ page: 0, size: SUMMARY_PAGE_SIZE, sort: 'createdAt,desc' }),
    enabled: role !== 'ADMIN' && role !== null,
  });
}