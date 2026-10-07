import { useMutation } from '@tanstack/react-query';
import { notifyError } from '@/shared/api/errorHandler';
import { cardsApi } from '@/shared/api/endpoints';
import { downloadBlob } from '@/shared/ui/downloadBlob';

export function useDownloadCardDocument(cardId: number) {
  return useMutation({
    mutationFn: async ({ docId, fileName }: { docId: number; fileName: string }) => {
      downloadBlob(await cardsApi.downloadDocument(cardId, docId), fileName);
    },
    onError: (error) => notifyError(error, 'Hujjatni yuklab olib bo\'lmadi'),
  });
}
