import { useMutation } from '@tanstack/react-query';
import { cardsApi } from '@/shared/api/endpoints';

export function useDownloadCardDocument(cardId: number) {
  return useMutation({
    mutationFn: async ({ docId, fileName }: { docId: number; fileName: string }) => {
      const blob = await cardsApi.downloadDocument(cardId, docId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    },
  });
}
