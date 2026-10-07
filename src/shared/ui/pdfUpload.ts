import { useCallback, useEffect, useRef } from 'react';
import { message, Upload } from 'antd';
import { env } from '@/shared/config/env';

const MAX_FILE_NAME_LENGTH = 255;

/** Bitta PDF faylni klient tomonda tekshiradi. Xato bo'lsa xabar ko'rsatadi. */
export function isAcceptablePdf(file: { name: string; size: number; type: string }): boolean {
  if (file.type !== 'application/pdf') {
    message.error(`${file.name} — faqat PDF fayllar qabul qilinadi`);
    return false;
  }
  if (file.name.length > MAX_FILE_NAME_LENGTH) {
    message.error(`${file.name.slice(0, 40)}… — fayl nomi ${MAX_FILE_NAME_LENGTH} belgidan oshmasligi kerak`);
    return false;
  }
  if (file.size > env.maxUploadSizeMb * 1024 * 1024) {
    message.error(`${file.name} — fayl hajmi ${env.maxUploadSizeMb}MB dan oshmasligi kerak`);
    return false;
  }
  return true;
}

/**
 * Antd Upload har bir tanlangan fayl uchun alohida beforeUpload chaqiradi.
 * Bu hook ularni bitta batchga yig'ib, onFiles ni FAQAT BIR MARTA chaqiradi,
 * va hech qachon avval yuborilgan fayllarni qayta yubormaydi.
 */
export function useBatchedPdfUpload(onFiles: (files: File[]) => void) {
  const queue = useRef<File[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handler = useRef(onFiles);

  useEffect(() => {
    handler.current = onFiles;
  }, [onFiles]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return useCallback((file: File) => {
    if (!isAcceptablePdf(file)) return Upload.LIST_IGNORE;
    queue.current.push(file);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const batch = queue.current;
      queue.current = [];
      timer.current = null;
      if (batch.length > 0) handler.current(batch);
    }, 0);
    // LIST_IGNORE: fayl Upload ichki ro'yxatiga tushmaydi, shuning uchun keyingi
    // tanlovda qayta yuborilmaydi.
    return Upload.LIST_IGNORE;
  }, []);
}
