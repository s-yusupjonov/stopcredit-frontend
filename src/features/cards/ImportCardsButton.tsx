import { useState } from 'react';
import { Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { extractRowErrors, notifyError } from '@/shared/api/errorHandler';
import type { ImportRowError } from '@/shared/api/types';
import { feedback } from '@/shared/ui/feedback';
import { useImportCards } from './hooks/useImportCards';
import { ImportErrorsModal } from './ImportErrorsModal';

export function ImportCardsButton() {
  const importMutation = useImportCards();
  const [rowErrors, setRowErrors] = useState<ImportRowError[]>([]);

  const handleImport = async (file: File) => {
    try {
      const { imported } = await importMutation.mutateAsync(file);
      feedback.message.success(`${imported} ta karta import qilindi`);
    } catch (error) {
      const errors = extractRowErrors(error);
      if (errors.length > 0) {
        setRowErrors(errors);
      } else {
        notifyError(error, "Excel faylni import qilib bo'lmadi");
      }
    }
  };

  return (
    <>
      <Upload
        accept=".xlsx"
        showUploadList={false}
        disabled={importMutation.isPending}
        beforeUpload={(file) => {
          void handleImport(file);
          return false;
        }}
      >
        <Button icon={<UploadOutlined />} loading={importMutation.isPending}>
          Excel yuklash
        </Button>
      </Upload>
      <ImportErrorsModal errors={rowErrors} onClose={() => setRowErrors([])} />
    </>
  );
}
