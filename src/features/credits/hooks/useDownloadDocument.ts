import { useMutation } from '@tanstack/react-query';
import { creditsApi } from '@/shared/api/endpoints';

export function useDownloadDocument(creditId: number) {
  return useMutation({
    mutationFn: async ({ docId, fileName }: { docId: number; fileName: string }) => {
      const blob = await creditsApi.downloadDocument(creditId, docId);
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
