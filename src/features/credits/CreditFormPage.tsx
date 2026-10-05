import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Form, Input, Select, Typography } from 'antd';
import { typeLabels, statusLabels } from '@/shared/ui/strings';
import { MoneyInput } from '@/shared/ui/MoneyInput';
import { handleFormError } from '@/shared/api/errorHandler';
import { useCredit } from './hooks/useCredit';
import { useCreateCredit } from './hooks/useCreateCredit';
import { useUpdateCredit } from './hooks/useUpdateCredit';
import { creditSchema, type CreditFormValues } from './schema';

export function CreditFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const creditId = Number(id);
  const navigate = useNavigate();

  const { data: existing, isLoading: isLoadingCredit } = useCredit(creditId);
  const createMutation = useCreateCredit();
  const updateMutation = useUpdateCredit(creditId);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
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
    if (isEdit && existing) {
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
        const result = await updateMutation.mutateAsync(payload);
        navigate(`/credits/${result.id}`);
      } else {
        const result = await createMutation.mutateAsync(payload);
        navigate(`/credits/${result.id}`);
      }
    } catch (error) {
      handleFormError(error, setError);
    }
  };

  if (isEdit && isLoadingCredit) {
    return <Card loading style={{ borderRadius: 12 }} />;
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {isEdit ? 'Kreditni tahrirlash' : 'Yangi kredit'}
      </Typography.Title>

      <Card style={{ borderRadius: 12 }}>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              label="Familiya"
              required
              style={{ flex: 1 }}
              validateStatus={errors.lastName ? 'error' : ''}
              help={errors.lastName?.message}
            >
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
            <Form.Item
              label="Ism"
              required
              style={{ flex: 1 }}
              validateStatus={errors.firstName ? 'error' : ''}
              help={errors.firstName?.message}
            >
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Sharif"
            validateStatus={errors.middleName ? 'error' : ''}
            help={errors.middleName?.message}
          >
            <Controller
              name="middleName"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item
            label="PINFL"
            required
            validateStatus={errors.pinfl ? 'error' : ''}
            help={errors.pinfl?.message}
          >
            <Controller
              name="pinfl"
              control={control}
              render={({ field }) => <Input {...field} maxLength={14} />}
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              label="Kredit turi"
              required
              style={{ flex: 1 }}
              validateStatus={errors.type ? 'error' : ''}
              help={errors.type?.message}
            >
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={Object.entries(typeLabels).map(([value, label]) => ({
                      value,
                      label,
                    }))}
                  />
                )}
              />
            </Form.Item>
            <Form.Item
              label="MFO"
              required
              style={{ flex: 1 }}
              validateStatus={errors.mfo ? 'error' : ''}
              help={errors.mfo?.message}
            >
              <Controller
                name="mfo"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              label="Ariza raqami"
              required
              style={{ flex: 1 }}
              validateStatus={errors.applicationNumber ? 'error' : ''}
              help={errors.applicationNumber?.message}
            >
              <Controller
                name="applicationNumber"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
            <Form.Item
              label="Summa"
              required
              style={{ flex: 1 }}
              validateStatus={errors.amount ? 'error' : ''}
              help={errors.amount?.message}
            >
              <Controller
                name="amount"
                control={control}
                render={({ field }) => <MoneyInput {...field} min={0} />}
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Status"
            required
            validateStatus={errors.status ? 'error' : ''}
            help={errors.status?.message}
          >
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={Object.entries(statusLabels).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
              )}
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Saqlash
            </Button>
            <Button onClick={() => navigate(-1)}>Bekor qilish</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}