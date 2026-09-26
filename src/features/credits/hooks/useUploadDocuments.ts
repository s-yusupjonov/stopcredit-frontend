import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { creditsApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';

export function useUploadDocuments(creditId: number) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (files: File[]) =>
      creditsApi.uploadDocuments(creditId, files, setProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credits.detail(creditId) });
      setProgress(0);
    },
    onError: () => setProgress(0),
  });

  return { ...mutation, progress };
}
