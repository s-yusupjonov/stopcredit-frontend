import { useState } from 'react';
import { Button, Card, List, Popconfirm, Progress, Typography, Upload } from 'antd';
import type { UploadProps } from 'antd';
import { FilePdfOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import type { CardResponse } from '@/shared/api/types';
import { formatFileSize, formatDate } from '@/shared/ui/formatters';
import { useBatchedPdfUpload } from '@/shared/ui/pdfUpload';
import { colors } from '@/shared/theme';
import { useUploadCardDocuments } from './hooks/useUploadCardDocuments';
import { useDeleteCardDocument } from './hooks/useDeleteCardDocument';
import { useDownloadCardDocument } from './hooks/useDownloadCardDocument';

interface CardDocumentsSectionProps {
  card: CardResponse;
  canManage: boolean;
}

export function CardDocumentsSection({ card, canManage }: CardDocumentsSectionProps) {
  const uploadMutation = useUploadCardDocuments(card.id);
  const deleteMutation = useDeleteCardDocument(card.id);
  const downloadMutation = useDownloadCardDocument(card.id);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const documents = card.documents ?? [];

  const beforeUpload = useBatchedPdfUpload((files) => uploadMutation.mutate(files));

  const uploadProps: UploadProps = {
    multiple: true,
    accept: 'application/pdf',
    showUploadList: false,
    disabled: uploadMutation.isPending,
    beforeUpload,
  };

  return (
    <Card title="Hujjatlar" style={{ borderRadius: 12, marginTop: 16 }}>
      {documents.length === 0 && <Typography.Text type="secondary">Hujjatlar mavjud emas</Typography.Text>}

      {documents.length > 0 && (
        <List
          dataSource={documents}
          renderItem={(doc) => (
            <List.Item
              actions={[
                <Button
                  key="download"
                  type="link"
                  onClick={() => downloadMutation.mutate({ docId: doc.id, fileName: doc.fileName })}
                >
                  Yuklab olish
                </Button>,
                canManage && (
                  <Popconfirm
                    key="delete"
                    title="Hujjatni o'chirasizmi?"
                    description="Bu amalni ortga qaytarib bo'lmaydi."
                    okText="O'chirish"
                    cancelText="Bekor qilish"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => {
                      setPendingDeleteId(doc.id);
                      deleteMutation.mutate(doc.id);
                    }}
                  >
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      aria-label="Hujjatni o'chirish"
                      loading={deleteMutation.isPending && pendingDeleteId === doc.id}
                    />
                  </Popconfirm>
                ),
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={<FilePdfOutlined style={{ fontSize: 20, color: colors.danger }} />}
                title={doc.fileName}
                description={`${formatFileSize(doc.sizeBytes)} · ${doc.uploadedBy} · ${formatDate(doc.uploadedAt)}`}
              />
            </List.Item>
          )}
        />
      )}

      {canManage && (
        <div style={{ marginTop: 12 }}>
          <Upload.Dragger {...uploadProps} style={{ padding: 8 }}>
            <p style={{ fontSize: 24, color: colors.primary, margin: 0 }}>
              <InboxOutlined />
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 13 }}>
              PDF fayllarni shu yerga tashlang yoki yuklash uchun bosing
            </p>
          </Upload.Dragger>
          {uploadMutation.isPending && (
            <Progress percent={uploadMutation.progress} size="small" style={{ marginTop: 8 }} />
          )}
        </div>
      )}
    </Card>
  );
}
