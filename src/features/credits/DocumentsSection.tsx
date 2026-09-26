import { useState } from 'react';
import { Button, Card, List, Progress, Typography, Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import { FilePdfOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import type { CreditResponse, CreditStage } from '@/shared/api/types';
import { formatFileSize, formatDate } from '@/shared/ui/formatters';
import { stageLabels } from '@/shared/ui/strings';
import { env } from '@/shared/config/env';
import { colors } from '@/shared/theme';
import { useUploadDocuments } from './hooks/useUploadDocuments';
import { useDeleteDocument } from './hooks/useDeleteDocument';
import { useDownloadDocument } from './hooks/useDownloadDocument';

interface DocumentsSectionProps {
  credit: CreditResponse;
  canManageCurrentStage: boolean;
}

export function DocumentsSection({ credit, canManageCurrentStage }: DocumentsSectionProps) {
  const uploadMutation = useUploadDocuments(credit.id);
  const deleteMutation = useDeleteDocument(credit.id);
  const downloadMutation = useDownloadDocument(credit.id);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const documentsByStage = new Map<CreditStage, typeof credit.documents>();
  (credit.documents ?? []).forEach((doc) => {
    const list = documentsByStage.get(doc.stage) ?? [];
    list.push(doc);
    documentsByStage.set(doc.stage, list);
  });

  const stagesWithDocs = Array.from(documentsByStage.keys());
  if (canManageCurrentStage && !documentsByStage.has(credit.stage)) {
    stagesWithDocs.push(credit.stage);
  }

  const uploadProps: UploadProps = {
    multiple: true,
    accept: 'application/pdf',
    showUploadList: false,
    beforeUpload: (file) => {
      if (file.type !== 'application/pdf') {
        message.error(`${file.name} — faqat PDF fayllar qabul qilinadi`);
        return Upload.LIST_IGNORE;
      }
      const maxBytes = env.maxUploadSizeMb * 1024 * 1024;
      if (file.size > maxBytes) {
        message.error(`${file.name} — fayl hajmi ${env.maxUploadSizeMb}MB dan oshmasligi kerak`);
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    customRequest: () => {},
    onChange: (info) => {
      const files = info.fileList
        .map((f) => f.originFileObj)
        .filter((f): f is File => !!f);
      if (files.length > 0) {
        uploadMutation.mutate(files);
      }
    },
  };

  return (
    <Card title="Hujjatlar" style={{ borderRadius: 12, marginTop: 16 }}>
      {stagesWithDocs.length === 0 && (
        <Typography.Text type="secondary">Hujjatlar mavjud emas</Typography.Text>
      )}

      {stagesWithDocs.map((stage) => {
        const docs = documentsByStage.get(stage) ?? [];
        const isCurrentEditableStage = canManageCurrentStage && stage === credit.stage;

        return (
          <div key={stage} style={{ marginBottom: 20 }}>
            <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
              {stageLabels[stage]}
            </Typography.Text>

            {docs.length > 0 && (
              <List
                dataSource={docs}
                renderItem={(doc) => (
                  <List.Item
                    actions={[
                      <Button
                        key="download"
                        type="link"
                        onClick={() =>
                          downloadMutation.mutate({ docId: doc.id, fileName: doc.fileName })
                        }
                      >
                        Yuklab olish
                      </Button>,
                      isCurrentEditableStage && (
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

            {isCurrentEditableStage && (
              <div style={{ marginTop: 8 }}>
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
          </div>
        );
      })}
    </Card>
  );
}
