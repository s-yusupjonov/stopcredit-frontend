import { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Col, Form, Input, Result, Row, Select } from 'antd';
import { typeLabels, statusLabels, stageLabels } from '@/shared/ui/strings';
import { MoneyInput } from '@/shared/ui/MoneyInput';
import { FormField } from '@/shared/ui/FormField';
import { PageHeader } from '@/shared/ui/PageHeader';
import { feedback } from '@/shared/ui/feedback';
import { handleFormError } from '@/shared/api/errorHandler';
import { QueryErrorState } from '@/shared/ui/QueryErrorState';
import { useBackNavigation } from '@/shared/ui/useBackNavigation';
import { useCredit } from './hooks/useCredit';
import { useCreateCredit } from './hooks/useCreateCredit';
import { useUpdateCredit } from './hooks/useUpdateCredit';
import { creditSchema, type CreditFormValues } from './schema';

const typeOptions = Object.entries(typeLabels).map(([value, label]) => ({ value, label }));
const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({ value, label }));

export function CreditFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const creditId = Number(id);
  const navigate = useNavigate();
  const cancel = useBackNavigation(isEdit ? `/credits/${id}` : '/credits');

  const {
    data: existing,
    isLoading: isLoadingCredit,
    isError: isLoadError,
    error: loadError,
    refetch,
  } = useCredit(isEdit ? creditId : Number.NaN);
  const initializedFor = useRef<number | null>(null);
  const createMutation = useCreateCredit();
  const updateMutation = useUpdateCredit(creditId);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<CreditFormValues>({
    resolver: zodResolver(creditSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      pinfl: '',
      type: 'ONLINE',
      mfo: '',
      applicationNumber: '',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (isEdit && existing && initializedFor.current !== existing.id) {
      initializedFor.current = existing.id;
      reset({
        firstName: existing.firstName,
        lastName: existing.lastName,
        middleName: existing.middleName ?? '',
        pinfl: existing.pinfl,
        type: existing.type,
        mfo: existing.mfo,
        applicationNumber: existing.applicationNumber,
        amount: existing.amount,
        status: existing.status,
      });
    }
  }, [isEdit, existing, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: CreditFormValues) => {
    const payload = { ...values, middleName: values.middleName || undefined };
    try {
      if (isEdit) {
        const result = await updateMutation.mutateAsync({ ...payload, version: existing?.version });
        feedback.message.success("O'zgarishlar saqlandi");
        navigate(`/credits/${result.id}`, { replace: true });
      } else {
        const result = await createMutation.mutateAsync(payload);
        feedback.message.success('Kredit yaratildi');
        navigate(`/credits/${result.id}`, { replace: true });
      }
    } catch (error) {
      handleFormError(error, setError);
    }
  };

  if (isEdit && isLoadError && !existing) {
    return <QueryErrorState error={loadError} onRetry={() => void refetch()} />;
  }

  if (isEdit && (isLoadingCredit || !existing)) {
    return <Card loading style={{ borderRadius: 12 }} />;
  }

  // The API accepts edits only while the credit is still at the Anti-fraud stage
  if (isEdit && existing && existing.stage !== 'ANTI_FRAUD') {
    return (
      <Card style={{ borderRadius: 12 }}>
        <Result
          status="warning"
          title="Kreditni tahrirlab bo'lmaydi"
          subTitle={`Kredit "${stageLabels[existing.stage]}" bosqichida. Ma'lumotlarni faqat Anti-fraud bosqichida o'zgartirish mumkin.`}
          extra={
            <Button type="primary" onClick={() => navigate(`/credits/${existing.id}`, { replace: true })}>
              Kreditga qaytish
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <PageHeader title={isEdit ? 'Kreditni tahrirlash' : 'Yangi kredit'} />

      <Card style={{ borderRadius: 12 }}>
        <Form layout="vertical" onFinish={() => void handleSubmit(onSubmit)()}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <FormField label="Familiya" required htmlFor="lastName" error={errors.lastName?.message}>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => <Input {...field} id="lastName" maxLength={100} autoFocus />}
                />
              </FormField>
            </Col>
            <Col xs={24} md={8}>
              <FormField label="Ism" required htmlFor="firstName" error={errors.firstName?.message}>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => <Input {...field} id="firstName" maxLength={100} />}
                />
              </FormField>
            </Col>
            <Col xs={24} md={8}>
              <FormField label="Sharif" htmlFor="middleName" error={errors.middleName?.message}>
                <Controller
                  name="middleName"
                  control={control}
                  render={({ field }) => <Input {...field} id="middleName" maxLength={100} />}
                />
              </FormField>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <FormField label="PINFL" required htmlFor="pinfl" error={errors.pinfl?.message}>
                <Controller
                  name="pinfl"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="pinfl"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="14 ta raqam"
                      onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 14))}
                    />
                  )}
                />
              </FormField>
            </Col>
            <Col xs={24} md={12}>
              <FormField label="Kredit turi" required htmlFor="type" error={errors.type?.message}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => <Select {...field} id="type" options={typeOptions} />}
                />
              </FormField>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <FormField label="MFO" required htmlFor="mfo" error={errors.mfo?.message}>
                <Controller
                  name="mfo"
                  control={control}
                  render={({ field }) => <Input {...field} id="mfo" maxLength={25} />}
                />
              </FormField>
            </Col>
            <Col xs={24} md={8}>
              <FormField
                label="Ariza raqami"
                required
                htmlFor="applicationNumber"
                error={errors.applicationNumber?.message}
              >
                <Controller
                  name="applicationNumber"
                  control={control}
                  render={({ field }) => <Input {...field} id="applicationNumber" maxLength={25} />}
                />
              </FormField>
            </Col>
            <Col xs={24} md={8}>
              <FormField label="Summa" required htmlFor="amount" error={errors.amount?.message}>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => <MoneyInput {...field} id="amount" min={0} />}
                />
              </FormField>
            </Col>
          </Row>

          {!isEdit && (
            <FormField label="Status" required htmlFor="status" error={errors.status?.message}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select {...field} id="status" options={statusOptions} style={{ maxWidth: 240 }} />
                )}
              />
            </FormField>
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
    </div>
  );
}
