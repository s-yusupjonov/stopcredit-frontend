import { useMutation } from '@tanstack/react-query';
import { notifyError } from '@/shared/api/errorHandler';
import { creditsApi } from '@/shared/api/endpoints';
import { downloadBlob } from '@/shared/ui/downloadBlob';

export function useDownloadDocument(creditId: number) {
  return useMutation({
    mutationFn: async ({ docId, fileName }: { docId: number; fileName: string }) => {
      downloadBlob(await creditsApi.downloadDocument(creditId, docId), fileName);
    },
    onError: (error) => notifyError(error, 'Hujjatni yuklab olib bo\'lmadi'),
  });
}
