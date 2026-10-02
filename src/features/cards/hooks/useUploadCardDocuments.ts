import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { cardsApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';

export function useUploadCardDocuments(cardId: number) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (files: File[]) => cardsApi.uploadDocuments(cardId, files, setProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.detail(cardId) });
      setProgress(0);
    },
    onError: () => setProgress(0),
  });

  return { ...mutation, progress };
}
