import { useMutation } from '@tanstack/react-query';
import { creditsApi } from '@/shared/api/endpoints';
import type { CreditsFilters } from '@/shared/api/types';

export function useExportCredits() {
  return useMutation({
    mutationFn: async (filters: CreditsFilters) => {
      const blob = await creditsApi.export(filters);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `kreditlar-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    },
  });
}
