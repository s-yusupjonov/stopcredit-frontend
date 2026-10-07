import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';
import { useState } from 'react';
import { cardsApi } from '@/shared/api/endpoints';
import { notifyError } from '@/shared/api/errorHandler';
import { queryKeys } from '@/shared/api/queryKeys';

export function useUploadCardDocuments(cardId: number) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (files: File[]) => cardsApi.uploadDocuments(cardId, files, setProgress),
    onSuccess: (docs) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.detail(cardId) });
      setProgress(0);
      notification.success({ message: `${docs.length} ta hujjat yuklandi` });
    },
    onError: (error) => {
      setProgress(0);
      notifyError(error, 'Hujjatlarni yuklab bo\'lmadi');
    },
  });

  return { ...mutation, progress };
}
