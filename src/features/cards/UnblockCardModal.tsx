import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Modal, Typography, Upload, message, notification } from 'antd';
import type { UploadFile } from 'antd';
import type { RcFile } from 'antd/es/upload';
import { InboxOutlined } from '@ant-design/icons';
import type { CardResponse } from '@/shared/api/types';
import { formatCardNumber, formatFileSize } from '@/shared/ui/formatters';
import { handleFormError } from '@/shared/api/errorHandler';
import { env } from '@/shared/config/env';
import { colors } from '@/shared/theme';
import { useUnblockCard } from './hooks/useUnblockCard';
import { unblockSchema, type UnblockFormValues } from './schema';

interface UnblockCardModalProps {
  card: Pick<CardResponse, 'id' | 'cardNumber'> | null;
  onClose: () => void;
}

const DEFAULT_VALUES: Partial<UnblockFormValues> = {
  orderNumber: '',
  comment: '',
  file: undefined,
};

function toUploadFile(file: File): UploadFile {
  return { uid: '-1', name: file.name, size: file.size, status: 'done' };
}

function isAcceptablePdf(file: RcFile): boolean {
  if (file.type !== 'application/pdf') {
    message.error(`${file.name} — faqat PDF fayllar qabul qilinadi`);
    return false;
  }
  if (file.size > env.maxUploadSizeMb * 1024 * 1024) {
    message.error(`${file.name} — fayl hajmi ${env.maxUploadSizeMb}MB dan oshmasligi kerak`);
    return false;
  }
  return true;
}

export function UnblockCardModal({ card, onClose }: UnblockCardModalProps) {
  const unblockMutation = useUnblockCard();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UnblockFormValues>({
    resolver: zodResolver(unblockSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const onSubmit = async (values: UnblockFormValues) => {
    if (!card) return;
    try {
      await unblockMutation.mutateAsync({
        id: card.id,
        orderNumber: values.orderNumber,
        comment: values.comment || undefined,
        file: values.file,
      });
      notification.success({ message: 'Karta blokdan ochildi' });
      onClose();
    } catch (error) {
      handleFormError(error, setError);
    }
  };

  return (
    <Modal
      title="Kartani blokdan ochish"
      open={card !== null}
      onCancel={onClose}
      onOk={handleSubmit(onSubmit)}
      okText="Blokdan ochish"
      cancelText="Bekor qilish"
      confirmLoading={unblockMutation.isPending}
      afterClose={() => reset(DEFAULT_VALUES)}
      destroyOnClose
    >
      {card && (
        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          Karta: <Typography.Text strong>{formatCardNumber(card.cardNumber)}</Typography.Text>
        </Typography.Paragraph>
      )}

      <Form layout="vertical">
        <Form.Item
          label="Buyruq raqami"
          required
          validateStatus={errors.orderNumber ? 'error' : ''}
          help={errors.orderNumber?.message}
        >
          <Controller
            name="orderNumber"
            control={control}
            render={({ field }) => (
              <Input {...field} maxLength={500} placeholder="MB 22.05.2026, MB 45-15/2108" />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Buyruq (PDF)"
          required
          validateStatus={errors.file ? 'error' : ''}
          help={errors.file?.message}
        >
          <Controller
            name="file"
            control={control}
            render={({ field }) => (
              <Upload.Dragger
                accept="application/pdf"
                maxCount={1}
                multiple={false}
                fileList={field.value ? [toUploadFile(field.value)] : []}
                beforeUpload={(file) => {
                  if (!isAcceptablePdf(file)) return Upload.LIST_IGNORE;
                  field.onChange(file);
                  return false;
                }}
                onRemove={() => field.onChange(undefined)}
              >
                <p style={{ fontSize: 24, color: colors.primary, margin: 0 }}>
                  <InboxOutlined />
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 13 }}>
                  {field.value
                    ? `${field.value.name} (${formatFileSize(field.value.size)})`
                    : 'PDF faylni shu yerga tashlang yoki tanlash uchun bosing'}
                </p>
              </Upload.Dragger>
            )}
          />
        </Form.Item>

        <Form.Item
          label="Eslatma (ixtiyoriy)"
          validateStatus={errors.comment ? 'error' : ''}
          help={errors.comment?.message}
        >
          <Controller
            name="comment"
            control={control}
            render={({ field }) => (
              <Input.TextArea {...field} rows={3} maxLength={500} showCount />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}