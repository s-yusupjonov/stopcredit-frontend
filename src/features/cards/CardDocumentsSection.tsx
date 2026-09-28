import { useState } from 'react';
import { Button, Card, List, Progress, Typography, Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import { FilePdfOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import type { CardResponse } from '@/shared/api/types';
import { formatFileSize, formatDate } from '@/shared/ui/formatters';
import { env } from '@/shared/config/env';
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

  const uploadProps: UploadProps = {
    multiple: true,
    accept: 'application/pdf',
    showUploadList: false,
    beforeUpload: (file) => {
      if (file.type !== 'application/pdf') {
        message.error(`${file.name} — faqat PDF fayllar qabul qilinadi`);
        return Upload.LIST_IGNORE;
      }
      if (file.size > env.maxUploadSizeMb * 1024 * 1024) {
        message.error(`${file.name} — fayl hajmi ${env.maxUploadSizeMb}MB dan oshmasligi kerak`);
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    customRequest: () => {},
    onChange: (info) => {
      const files = info.fileList
        .map((f) => f.originFileObj)
        .filter((f): f is NonNullable<typeof f> => !!f);
      if (files.length > 0) {
        uploadMutation.mutate(files);
      }
    },
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
                  <Button
                    key="delete"
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    loading={deleteMutation.isPending && pendingDeleteId === doc.id}
                    onClick={() => {
                      setPendingDeleteId(doc.id);
                      deleteMutation.mutate(doc.id);
                    }}
                  />
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
