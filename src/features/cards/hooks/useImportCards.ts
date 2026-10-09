import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';

export function useImportCards() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => cardsApi.importBlocked(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
    },
  });
}
