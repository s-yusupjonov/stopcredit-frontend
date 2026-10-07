import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Modal, Typography, Upload } from 'antd';
import type { UploadFile } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { CardResponse } from '@/shared/api/types';
import { formatCardNumber, formatFileSize } from '@/shared/ui/formatters';
import { handleFormError } from '@/shared/api/errorHandler';
import { FormField } from '@/shared/ui/FormField';
import { ImplicitSubmit } from '@/shared/ui/ImplicitSubmit';
import { feedback } from '@/shared/ui/feedback';
import { PDF_ACCEPT, isAcceptablePdf } from '@/shared/ui/pdfUpload';
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
      feedback.message.success('Karta blokdan ochildi');
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
      onOk={() => void handleSubmit(onSubmit)()}
      okText="Blokdan ochish"
      cancelText="Bekor qilish"
      confirmLoading={unblockMutation.isPending}
      afterClose={() => reset(DEFAULT_VALUES)}
      destroyOnHidden
    >
      {card && (
        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          Karta: <Typography.Text strong>{formatCardNumber(card.cardNumber)}</Typography.Text>
        </Typography.Paragraph>
      )}

      <Form layout="vertical" onFinish={() => void handleSubmit(onSubmit)()}>
        <ImplicitSubmit />
        <FormField label="Buyruq raqami" required htmlFor="unblock-order" error={errors.orderNumber?.message}>
          <Controller
            name="orderNumber"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="unblock-order"
                autoFocus
                maxLength={500}
                placeholder="MB 22.05.2026, MB 45-15/2108"
              />
            )}
          />
        </FormField>

        <FormField label="Buyruq (PDF)" required htmlFor="unblock-file" error={errors.file?.message}>
          <Controller
            name="file"
            control={control}
            render={({ field }) => (
              <Upload.Dragger
                id="unblock-file"
                accept={PDF_ACCEPT}
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
                    ? `Tanlandi: ${formatFileSize(field.value.size)}. Almashtirish uchun boshqa faylni tashlang`
                    : 'PDF faylni shu yerga tashlang yoki tanlash uchun bosing'}
                </p>
              </Upload.Dragger>
            )}
          />
        </FormField>

        <FormField label="Eslatma (ixtiyoriy)" htmlFor="unblock-comment" error={errors.comment?.message}>
          <Controller
            name="comment"
            control={control}
            render={({ field }) => (
              <Input.TextArea {...field} id="unblock-comment" rows={3} maxLength={500} showCount />
            )}
          />
        </FormField>
      </Form>
    </Modal>
  );
}