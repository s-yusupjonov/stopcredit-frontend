import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Button, Card, Col, DatePicker, Form, Input, Row, Select, Space, Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { cardBasisLabels, cardRestrictionLabels, cardStatusLabels } from '@/shared/ui/strings';
import { MAX_AMOUNT, MoneyInput } from '@/shared/ui/MoneyInput';
import { FormField } from '@/shared/ui/FormField';
import { PageHeader } from '@/shared/ui/PageHeader';
import { feedback } from '@/shared/ui/feedback';
import { useBackNavigation } from '@/shared/ui/useBackNavigation';
import { formatCardNumber, formatExecutor } from '@/shared/ui/formatters';
import { handleFormError, notifyError } from '@/shared/api/errorHandler';
import { QueryErrorState } from '@/shared/ui/QueryErrorState';
import { cardsApi } from '@/shared/api/endpoints';
import { PDF_ACCEPT, isAcceptablePdf } from '@/shared/ui/pdfUpload';
import type { CardRequest } from '@/shared/api/types';
import { useCard } from './hooks/useCard';
import { useCreateCard } from './hooks/useCreateCard';
import { useUpdateCard } from './hooks/useUpdateCard';
import { useExecutors } from './hooks/useExecutors';
import { ExecutorModal } from './ExecutorModal';
import { cardSchema, type CardFormValues } from './schema';

const toOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

interface PendingFile {
  uid: string;
  file: File;
}

export function CardFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const cardId = Number(id);
  const navigate = useNavigate();
  const cancel = useBackNavigation(isEdit ? `/cards/${id}` : '/cards/blocked');

  const {
    data: existing,
    isLoading: isLoadingCard,
    isError: isLoadError,
    error: loadError,
    refetch,
  } = useCard(isEdit ? cardId : Number.NaN);
  const initializedFor = useRef<number | null>(null);
  const { data: executors = [], isLoading: isLoadingExecutors } = useExecutors();
  const createMutation = useCreateCard();
  const updateMutation = useUpdateCard(cardId);
  const [executorModalOpen, setExecutorModalOpen] = useState(false);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isDirty },
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
        balance: existing.balance,
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

  const uploadList: UploadFile[] = files.map(({ uid, file }) => ({
    uid,
    name: file.name,
    size: file.size,
    status: 'done',
  }));

  const uploadProps: UploadProps = {
    multiple: true,
    accept: PDF_ACCEPT,
    fileList: uploadList,
    beforeUpload: (file) => {
      if (!isAcceptablePdf(file)) return Upload.LIST_IGNORE;
      setFiles((prev) => [...prev, { uid: file.uid, file }]);
      // keep the file local; it is sent together with the card after it is saved
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
        const result = await updateMutation.mutateAsync({ ...payload, version: existing?.version });
        feedback.message.success("O'zgarishlar saqlandi");
        navigate(`/cards/${result.id}`, { replace: true });
        return;
      }
      const result = await createMutation.mutateAsync(payload);
      if (files.length > 0) {
        setIsUploading(true);
        try {
          await cardsApi.uploadDocuments(
            result.id,
            files.map((f) => f.file),
          );
        } catch (uploadError) {
          notifyError(uploadError, 'Karta saqlandi, lekin hujjatlarni yuklashda xatolik yuz berdi');
        } finally {
          setIsUploading(false);
        }
      }
      feedback.message.success('Karta saqlandi');
      navigate(`/cards/${result.id}`, { replace: true });
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
    <div style={{ maxWidth: 820 }}>
      <PageHeader title={isEdit ? 'Kartani tahrirlash' : 'Yangi karta'} />

      <Card style={{ borderRadius: 12 }}>
        <Form layout="vertical" onFinish={() => void handleSubmit(onSubmit)()}>
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <FormField
                label="Karta raqami"
                required
                htmlFor="cardNumber"
                error={errors.cardNumber?.message}
              >
                <Controller
                  name="cardNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="cardNumber"
                      ref={field.ref}
                      value={formatCardNumber(field.value ?? '')}
                      inputMode="numeric"
                      autoComplete="off"
                      autoFocus={!isEdit}
                      placeholder="0000 0000 0000 0000"
                      onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </FormField>
            </Col>
            <Col xs={24} md={8}>
              <FormField label="MFO" htmlFor="mfo" error={errors.mfo?.message}>
                <Controller
                  name="mfo"
                  control={control}
                  render={({ field }) => <Input {...field} id="mfo" maxLength={10} />}
                />
              </FormField>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <FormField label="Sana" htmlFor="restrictionDate" error={errors.restrictionDate?.message}>
                <Controller
                  name="restrictionDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      id="restrictionDate"
                      style={{ width: '100%' }}
                      format="DD.MM.YYYY"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : '')}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </FormField>
            </Col>
            <Col xs={24} md={8}>
              <FormField label="Karta balansi" htmlFor="balance" error={errors.balance?.message}>
                <Controller
                  name="balance"
                  control={control}
                  render={({ field }) => <MoneyInput {...field} id="balance" min={-MAX_AMOUNT} />}
                />
              </FormField>
            </Col>
            <Col xs={24} md={8}>
              <FormField label="Cheklov turi" htmlFor="restrictionType" error={errors.restrictionType?.message}>
                <Controller
                  name="restrictionType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="restrictionType"
                      allowClear
                      placeholder="Tanlang"
                      value={field.value ?? undefined}
                      onChange={(value) => field.onChange(value ?? null)}
                      onBlur={field.onBlur}
                      options={toOptions(cardRestrictionLabels)}
                    />
                  )}
                />
              </FormField>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <FormField label="Asos" required htmlFor="basisCategory" error={errors.basisCategory?.message}>
                <Controller
                  name="basisCategory"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      id="basisCategory"
                      placeholder="Tanlang"
                      options={toOptions(cardBasisLabels)}
                    />
                  )}
                />
              </FormField>
            </Col>
            <Col xs={24} md={16}>
              <FormField label="Buyruq raqami" htmlFor="basisComment" error={errors.basisComment?.message}>
                <Controller
                  name="basisComment"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="basisComment"
                      maxLength={500}
                      placeholder="MB 22.05.2026, MB 45-15/2108"
                    />
                  )}
                />
              </FormField>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <FormField
                label="Status"
                required
                htmlFor="status"
                error={errors.status?.message}
                extra={isEdit ? 'Statusni faqat "Blokdan ochish" amali orqali o\'zgartirish mumkin' : undefined}
              >
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      id="status"
                      disabled={isEdit}
                      options={toOptions(cardStatusLabels)}
                    />
                  )}
                />
              </FormField>
            </Col>
            <Col xs={24} md={16}>
              <FormField label="Eslatma" htmlFor="statusComment" error={errors.statusComment?.message}>
                <Controller
                  name="statusComment"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="statusComment"
                      maxLength={500}
                      placeholder="Karta bloklandi, blokdan ochilmasin"
                    />
                  )}
                />
              </FormField>
            </Col>
          </Row>

          <FormField label="Ijrochi" required htmlFor="executorId" error={errors.executorId?.message}>
            <Space.Compact style={{ width: '100%' }}>
              <Controller
                name="executorId"
                control={control}
                render={({ field }) => (
                  <Select
                    id="executorId"
                    showSearch
                    optionFilterProp="label"
                    placeholder="Ijrochini tanlang"
                    style={{ width: '100%' }}
                    loading={isLoadingExecutors}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={executors.map((e) => ({ value: e.id, label: formatExecutor(e) }))}
                  />
                )}
              />
              <Button icon={<PlusOutlined />} onClick={() => setExecutorModalOpen(true)}>
                Yangi
              </Button>
            </Space.Compact>
          </FormField>

          {!isEdit && (
            <Form.Item label="Hujjat (ixtiyoriy)">
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>PDF fayl tanlash</Button>
              </Upload>
            </Form.Item>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              disabled={isEdit && !isDirty}
            >
              Saqlash
            </Button>
            <Button onClick={cancel} disabled={isSubmitting}>
              Bekor qilish
            </Button>
          </div>
        </Form>
      </Card>

      <ExecutorModal
        open={executorModalOpen}
        onClose={() => setExecutorModalOpen(false)}
        onCreated={(executor) => {
          setValue('executorId', executor.id, { shouldValidate: true, shouldDirty: true });
          setExecutorModalOpen(false);
        }}
      />
    </div>
  );
}
