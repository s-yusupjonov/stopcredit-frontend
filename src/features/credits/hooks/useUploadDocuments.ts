import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';
import { useState } from 'react';
import { creditsApi } from '@/shared/api/endpoints';
import { notifyError } from '@/shared/api/errorHandler';
import { queryKeys } from '@/shared/api/queryKeys';

export function useUploadDocuments(creditId: number) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (files: File[]) => creditsApi.uploadDocuments(creditId, files, setProgress),
    onSuccess: (docs) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credits.detail(creditId) });
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
