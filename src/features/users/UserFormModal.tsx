import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Form, Input, Modal, Select, Switch } from 'antd';
import { FormField } from '@/shared/ui/FormField';
import { ImplicitSubmit } from '@/shared/ui/ImplicitSubmit';
import { confirmAction, feedback } from '@/shared/ui/feedback';
import { SearchOutlined } from '@ant-design/icons';
import type { UserResponse } from '@/shared/api/types';
import { roleLabels } from '@/shared/ui/strings';
import { getErrorStatus, handleFormError, notifyError } from '@/shared/api/errorHandler';
import { useAuth } from '@/features/auth/useAuth';
import { useCreateUser } from './hooks/useCreateUser';
import { useUpdateUser } from './hooks/useUpdateUser';
import { useAdLookup } from './hooks/useAdLookup';
import { buildUserSchema, type UserFormValues } from './schema';
import { SourceToggle } from './SourceToggle';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  editingUser: UserResponse | null;
}

export function UserFormModal({ open, onClose, editingUser }: UserFormModalProps) {
  const isCreate = !editingUser;
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const adLookup = useAdLookup();
  const { user: currentUser } = useAuth();
  const schema = useMemo(() => buildUserSchema(isCreate), [isCreate]);
  const [adChecked, setAdChecked] = useState<'idle' | 'found' | 'not-found' | 'registered'>('idle');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      authSource: 'LOCAL',
      username: '',
      fullName: '',
      role: 'ANTI_FRAUD',
      password: '',
      active: true,
    },
  });

  const authSource = watch('authSource');
  const username = watch('username');
  const isAdCreate = isCreate && authSource === 'AD';

  useEffect(() => {
    if (open) {
      setAdChecked('idle');
      reset(
        editingUser
          ? {
              authSource: editingUser.authSource,
              username: editingUser.username,
              fullName: editingUser.fullName,
              role: editingUser.role,
              password: '',
              active: editingUser.active,
            }
          : {
              authSource: 'LOCAL',
              username: '',
              fullName: '',
              role: 'ANTI_FRAUD',
              password: '',
              active: true,
            },
      );
    }
  }, [open, editingUser, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function handleAdSearch() {
    if (!username || !username.trim()) return;
    setAdChecked('idle');
    try {
      const result = await adLookup.mutateAsync(username.trim());
      if (result.registered) {
        setAdChecked('registered');
        setValue('fullName', '', { shouldValidate: false });
        return;
      }
      setValue('username', result.username, { shouldValidate: true });
      setValue('fullName', result.fullName, { shouldValidate: true });
      setAdChecked('found');
    } catch (error) {
      if (getErrorStatus(error) === 404) {
        setAdChecked('not-found');
        setValue('fullName', '', { shouldValidate: false });
        return;
      }
      notifyError(error, "AD'dan qidirishda xatolik yuz berdi");
    }
  }

  function confirmRisky(values: UserFormValues): Promise<boolean> {
    if (!editingUser || editingUser.role !== 'ADMIN' || !editingUser.active) return Promise.resolve(true);
    const losesAdmin = values.role !== 'ADMIN' || !values.active;
    if (!losesAdmin) return Promise.resolve(true);
    const isSelf = currentUser?.id === editingUser.id;
    return confirmAction({
      title: isSelf
        ? "O'zingizning administrator huquqingizni olib tashlamoqchimisiz?"
        : 'Administrator huquqini olib tashlamoqchimisiz?',
      content: values.active
        ? "Rol o'zgartiriladi va foydalanuvchi administrator sahifalariga kira olmaydi."
        : "Foydalanuvchi faolsizlantiriladi va tizimga kira olmaydi."
          + (isSelf ? ' Siz tizimdan chiqarilishingiz mumkin.' : ''),
      okText: 'Ha, davom etish',
      danger: true,
    });
  }

  const onSubmit = async (values: UserFormValues) => {
    if (isAdCreate && adChecked !== 'found') {
      setError('username', { type: 'manual', message: "Avval loginni AD dan qidirib tekshiring" });
      return;
    }
    if (!(await confirmRisky(values))) return;
    try {
      if (editingUser) {
        await updateMutation.mutateAsync({
          id: editingUser.id,
          payload: {
            fullName: values.fullName,
            role: values.role,
            active: values.active,
            ...(values.password ? { password: values.password } : {}),
          },
        });
        feedback.message.success("O'zgarishlar saqlandi");
      } else {
        await createMutation.mutateAsync({
          username: values.username.trim(),
          fullName: values.fullName,
          role: values.role,
          authSource: values.authSource,
          ...(values.authSource === 'LOCAL' ? { password: values.password ?? '' } : {}),
        });
        feedback.message.success('Foydalanuvchi yaratildi');
      }
      onClose();
    } catch (error) {
      handleFormError(error, setError);
    }
  };

  return (
    <Modal
      title={editingUser ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi'}
      open={open}
      onCancel={onClose}
      onOk={() => void handleSubmit(onSubmit)()}
      confirmLoading={isSubmitting}
      okText="Saqlash"
      cancelText="Bekor qilish"
      destroyOnHidden
    >
      {/* Enter submits the form, except in the AD search box where it runs the lookup */}
      <Form layout="vertical" onFinish={isAdCreate ? undefined : () => void handleSubmit(onSubmit)()}>
        {!isAdCreate && <ImplicitSubmit />}
        {isCreate && (
          <Form.Item label="Baza">
            <Controller
              name="authSource"
              control={control}
              render={({ field }) => (
                <SourceToggle
                  value={field.value}
                  onChange={(next) => {
                    field.onChange(next);
                    setAdChecked('idle');
                    if (next === 'AD') {
                      setValue('password', '');
                    } else {
                      setValue('fullName', '');
                    }
                  }}
                />
              )}
            />
          </Form.Item>
        )}

        <FormField
          label="Login"
          required
          htmlFor="user-username"
          error={errors.username?.message}
          extra={editingUser ? "Loginni o'zgartirib bo'lmaydi" : undefined}
        >
          <Controller
            name="username"
            control={control}
            render={({ field }) =>
              isAdCreate ? (
                <Input.Search
                  {...field}
                  id="user-username"
                  autoFocus
                  placeholder="AD dagi login"
                  enterButton={<SearchOutlined />}
                  loading={adLookup.isPending}
                  onSearch={handleAdSearch}
                  onChange={(e) => {
                    field.onChange(e);
                    setAdChecked('idle');
                  }}
                />
              ) : (
                <Input
                  {...field}
                  id="user-username"
                  autoFocus={!editingUser}
                  autoComplete="off"
                  disabled={!!editingUser}
                />
              )
            }
          />
        </FormField>

        {isAdCreate && adChecked === 'found' && (
          <Alert
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
            message="AD da topildi, F.I.Sh. avtomatik to'ldirildi"
          />
        )}
        {isAdCreate && adChecked === 'not-found' && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            message="Bunday login AD (Active Directory) da topilmadi"
          />
        )}
        {isAdCreate && adChecked === 'registered' && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            message="Bu login allaqachon ro'yxatdan o'tgan"
          />
        )}

        <FormField
          label="F.I.Sh."
          required
          htmlFor="user-fullName"
          error={errors.fullName?.message}
          extra={isAdCreate ? "AD dan avtomatik to'ldiriladi" : undefined}
        >
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="user-fullName"
                maxLength={150}
                readOnly={isAdCreate}
                disabled={isAdCreate && adChecked !== 'found'}
              />
            )}
          />
        </FormField>

        <FormField label="Rol" required htmlFor="user-role" error={errors.role?.message}>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                id="user-role"
                options={Object.entries(roleLabels).map(([value, label]) => ({ value, label }))}
              />
            )}
          />
        </FormField>

        {(!isCreate ? editingUser?.authSource !== 'AD' : authSource === 'LOCAL') && (
          <FormField
            label={editingUser ? "Yangi parol (o'zgartirmaslik uchun bo'sh qoldiring)" : 'Parol'}
            required={isCreate}
            htmlFor="user-password"
            error={errors.password?.message}
            extra="6 dan 72 tagacha belgi"
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password {...field} id="user-password" autoComplete="new-password" />
              )}
            />
          </FormField>
        )}

        {editingUser && (
          <Form.Item label="Faol" htmlFor="user-active">
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <Switch id="user-active" checked={field.value} onChange={field.onChange} />
              )}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}