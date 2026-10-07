import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Select,
  Typography,
  Upload,
  notification,
} from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { cardBasisLabels, cardRestrictionLabels, cardStatusLabels } from '@/shared/ui/strings';
import { MoneyInput } from '@/shared/ui/MoneyInput';
import { formatCardNumber, formatExecutor } from '@/shared/ui/formatters';
import { handleFormError, notifyError } from '@/shared/api/errorHandler';
import { QueryErrorState } from '@/shared/ui/QueryErrorState';
import { cardsApi } from '@/shared/api/endpoints';
import { isAcceptablePdf } from '@/shared/ui/pdfUpload';
import type { CardRequest } from '@/shared/api/types';
import { useCard } from './hooks/useCard';
import { useCreateCard } from './hooks/useCreateCard';
import { useUpdateCard } from './hooks/useUpdateCard';
import { useExecutors } from './hooks/useExecutors';
import { ExecutorModal } from './ExecutorModal';
import { cardSchema, type CardFormValues } from './schema';

export function CardFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const cardId = Number(id);
  const navigate = useNavigate();

  const {
    data: existing,
    isLoading: isLoadingCard,
    isError: isLoadError,
    error: loadError,
    refetch,
  } = useCard(cardId);
  const initializedFor = useRef<number | null>(null);
  const { data: executors = [], isLoading: isLoadingExecutors } = useExecutors();
  const createMutation = useCreateCard();
  const updateMutation = useUpdateCard(cardId);
  const [executorModalOpen, setExecutorModalOpen] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardNumber: '',
      mfo: '',
      restrictionDate: '',
      balance: null,
      restrictionType: null,
      basisComment: '',
      status: 'BLOCKED',
      statusComment: '',
    },
  });

  useEffect(() => {
    if (isEdit && existing && initializedFor.current !== existing.id) {
      initializedFor.current = existing.id;
      reset({
        cardNumber: existing.cardNumber,
        mfo: existing.mfo ?? '',
        restrictionDate: existing.restrictionDate ?? '',
        balance: existing.balance ?? null,
        restrictionType: existing.restrictionType,
        basisCategory: existing.basisCategory,
        basisComment: existing.basisComment ?? '',
        status: existing.status,
        statusComment: existing.statusComment ?? '',
        executorId: existing.executor.id,
      });
    }
  }, [isEdit, existing, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending || isUploading;

  const uploadProps: UploadProps = {
    multiple: true,
    accept: 'application/pdf',
    fileList: files,
    beforeUpload: (file) => {
      if (!isAcceptablePdf(file)) return Upload.LIST_IGNORE;
      setFiles((prev) => [...prev, file]);
      return false;
    },
    onRemove: (file) => {
      setFiles((prev) => prev.filter((f) => f.uid !== file.uid));
    },
  };

  const onSubmit = async (values: CardFormValues) => {
    const payload: CardRequest = {
      cardNumber: values.cardNumber,
      mfo: values.mfo || undefined,
      restrictionDate: values.restrictionDate || undefined,
      balance: values.balance ?? undefined,
      restrictionType: values.restrictionType ?? undefined,
      basisCategory: values.basisCategory,
      basisComment: values.basisComment || undefined,
      status: values.status,
      statusComment: values.statusComment || undefined,
      executorId: values.executorId,
    };
    try {
      if (isEdit) {
        const result = await updateMutation.mutateAsync(payload);
        navigate(`/cards/${result.id}`);
        return;
      }
      const result = await createMutation.mutateAsync(payload);
      if (files.length > 0) {
        setIsUploading(true);
        try {
          await cardsApi.uploadDocuments(
            result.id,
            files.map((f) => f.originFileObj ?? (f as unknown as File)),
          );
        } catch (uploadError) {
          notifyError(uploadError, 'Karta saqlandi, lekin hujjatlarni yuklashda xatolik yuz berdi');
        } finally {
          setIsUploading(false);
        }
      }
      notification.success({ message: 'Karta saqlandi' });
      navigate(`/cards/${result.id}`);
    } catch (error) {
      handleFormError(error, setError);
    }
  };

  if (isEdit && isLoadError && !existing) {
    return <QueryErrorState error={loadError} onRetry={() => void refetch()} />;
  }

  if (isEdit && (isLoadingCard || !existing)) {
    return <Card loading style={{ borderRadius: 12 }} />;
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {isEdit ? 'Kartani tahrirlash' : 'Yangi karta'}
      </Typography.Title>

      <Card style={{ borderRadius: 12 }}>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              label="Karta raqami"
              required
              style={{ flex: 2 }}
              validateStatus={errors.cardNumber ? 'error' : ''}
              help={errors.cardNumber?.message}
            >
              <Controller
                name="cardNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    value={formatCardNumber(field.value ?? '')}
                    maxLength={19}
                    placeholder="0000 0000 0000 0000"
                    onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </Form.Item>
            <Form.Item
              label="MFO"
              style={{ flex: 1 }}
              validateStatus={errors.mfo ? 'error' : ''}
              help={errors.mfo?.message}
            >
              <Controller
                name="mfo"
                control={control}
                render={({ field }) => <Input {...field} maxLength={10} />}
              />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              label="Sana"
              style={{ flex: 1 }}
              validateStatus={errors.restrictionDate ? 'error' : ''}
              help={errors.restrictionDate?.message}
            >
              <Controller
                name="restrictionDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : '')}
                  />
                )}
              />
            </Form.Item>
            <Form.Item
              label="Karta balansi"
              style={{ flex: 1 }}
              validateStatus={errors.balance ? 'error' : ''}
              help={errors.balance?.message}
            >
              <Controller
                name="balance"
                control={control}
                render={({ field }) => <MoneyInput {...field} />}
              />
            </Form.Item>
            <Form.Item
              label="Cheklov turi"
              style={{ flex: 1 }}
              validateStatus={errors.restrictionType ? 'error' : ''}
              help={errors.restrictionType?.message}
            >
              <Controller
                name="restrictionType"
                control={control}
                render={({ field }) => (
                  <Select
                    allowClear
                    value={field.value ?? undefined}
                    onChange={(value) => field.onChange(value ?? null)}
                    options={Object.entries(cardRestrictionLabels).map(([value, label]) => ({
                      value,
                      label,
                    }))}
                  />
                )}
              />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              label="Asos"
              required
              style={{ flex: 1 }}
              validateStatus={errors.basisCategory ? 'error' : ''}
              help={errors.basisCategory?.message}
            >
              <Controller
                name="basisCategory"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Tanlang"
                    options={Object.entries(cardBasisLabels).map(([value, label]) => ({
                      value,
                      label,
                    }))}
                  />
                )}
              />
            </Form.Item>
            <Form.Item
              label="Buyruq raqami"
              style={{ flex: 2 }}
              validateStatus={errors.basisComment ? 'error' : ''}
              help={errors.basisComment?.message}
            >
              <Controller
                name="basisComment"
                control={control}
                render={({ field }) => (
                  <Input {...field} maxLength={500} placeholder="MB 22.05.2026, MB 45-15/2108" />
                )}
              />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              label="Status"
              required
              style={{ flex: 1 }}
              validateStatus={errors.status ? 'error' : ''}
              help={errors.status?.message}
            >
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={Object.entries(cardStatusLabels).map(([value, label]) => ({
                      value,
                      label,
                    }))}
                  />
                )}
              />
            </Form.Item>
            <Form.Item
              label="Eslatma"
              style={{ flex: 2 }}
              validateStatus={errors.statusComment ? 'error' : ''}
              help={errors.statusComment?.message}
            >
              <Controller
                name="statusComment"
                control={control}
                render={({ field }) => (
                  <Input {...field} maxLength={500} placeholder="Karta bloklandi, blokdan ochilmasin" />
                )}
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Ijrochi"
            required
            validateStatus={errors.executorId ? 'error' : ''}
            help={errors.executorId?.message}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <Controller
                name="executorId"
                control={control}
                render={({ field }) => (
                  <Select
                    showSearch
                    optionFilterProp="label"
                    placeholder="Ijrochini tanlang"
                    style={{ flex: 1 }}
                    loading={isLoadingExecutors}
                    value={field.value}
                    onChange={field.onChange}
                    options={executors.map((e) => ({ value: e.id, label: formatExecutor(e) }))}
                  />
                )}
              />
              <Button icon={<PlusOutlined />} onClick={() => setExecutorModalOpen(true)}>
                Yangi
              </Button>
            </div>
          </Form.Item>

          {!isEdit && (
            <Form.Item label="Hujjat (ixtiyoriy)">
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>PDF fayl tanlash</Button>
              </Upload>
            </Form.Item>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Saqlash
            </Button>
            <Button onClick={() => navigate(-1)}>Bekor qilish</Button>
          </div>
        </Form>
      </Card>

      <ExecutorModal
        open={executorModalOpen}
        onClose={() => setExecutorModalOpen(false)}
        onCreated={(executor) => {
          setValue('executorId', executor.id, { shouldValidate: true });
          setExecutorModalOpen(false);
        }}
      />
    </div>
  );
}