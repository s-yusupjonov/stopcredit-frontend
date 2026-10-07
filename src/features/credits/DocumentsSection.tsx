import { useState } from 'react';
import { Button, Card, List, Popconfirm, Progress, Typography, Upload } from 'antd';
import type { UploadProps } from 'antd';
import { FilePdfOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import type { CreditResponse, CreditStage } from '@/shared/api/types';
import { formatFileSize, formatDate } from '@/shared/ui/formatters';
import { stageLabels } from '@/shared/ui/strings';
import { useBatchedPdfUpload } from '@/shared/ui/pdfUpload';
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
                        loading={downloadMutation.isPending && downloadMutation.variables?.docId === doc.id}
                        onClick={() =>
                          downloadMutation.mutate({ docId: doc.id, fileName: doc.fileName })
                        }
                      >
                        Yuklab olish
                      </Button>,
                      isCurrentEditableStage && (
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
