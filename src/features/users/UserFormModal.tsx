import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Modal, Select, Switch, Spin } from 'antd';
import { FormField } from '@/shared/ui/FormField';
import { ImplicitSubmit } from '@/shared/ui/ImplicitSubmit';
import { confirmAction, feedback } from '@/shared/ui/feedback';
import { useDebouncedValue } from '@/shared/ui/useDebouncedValue';
import type { UserResponse } from '@/shared/api/types';
import { roleLabels } from '@/shared/ui/strings';
import { colors } from '@/shared/theme';
import { errorMessage, getErrorStatus, handleFormError, isNetworkError } from '@/shared/api/errorHandler';
import { useAuth } from '@/features/auth/useAuth';
import { useCreateUser } from './hooks/useCreateUser';
import { useUpdateUser } from './hooks/useUpdateUser';
import { AD_SEARCH_MIN_LENGTH, useAdSearch } from './hooks/useAdSearch';
import { buildUserSchema, type UserFormValues } from './schema';
import { SourceToggle } from './SourceToggle';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  editingUser: UserResponse | null;
}

interface AdOption {
  /** AD login (sAMAccountName). */
  value: string;
  /** Full name as stored in AD. */
  label: string;
  registered: boolean;
  disabled: boolean;
}

interface AdSelectValue {
  value: string;
  label: ReactNode;
}

const AD_SEARCH_DELAY_MS = 400;

const emptyValues: UserFormValues = {
  authSource: 'LOCAL',
  username: '',
  fullName: '',
  role: 'ANTI_FRAUD',
  password: '',
  active: true,
};

export function UserFormModal({ open, onClose, editingUser }: UserFormModalProps) {
  const isCreate = !editingUser;
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const { user: currentUser } = useAuth();
  const schema = useMemo(() => buildUserSchema(isCreate), [isCreate]);
  const [searchText, setSearchText] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  });

  const authSource = watch('authSource');
  const fullName = watch('fullName');
  const isAdCreate = isCreate && authSource === 'AD';
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // AD search: the text is debounced and the lookup is a query, so a slow answer for older
  // input can never replace the answer for newer input.
  const typed = searchText.trim();
  const debounced = useDebouncedValue(typed, AD_SEARCH_DELAY_MS);
  const search = useAdSearch(isAdCreate ? debounced : '');
  const searchActive = isAdCreate && typed.length >= AD_SEARCH_MIN_LENGTH;
  const searching = searchActive && (typed !== debounced || search.isFetching);

  const adOptions: AdOption[] = useMemo(
    () =>
      searchActive && search.data
        ? search.data.map((found) => ({
            value: found.username,
            label: found.fullName,
            registered: found.registered,
            disabled: found.registered,
          }))
        : [],
    [searchActive, search.data],
  );

  useEffect(() => {
    if (!open) return;
    setSearchText('');
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
        : emptyValues,
    );
  }, [open, editingUser, reset]);

  function adNotFoundContent(): ReactNode {
    if (typed.length < AD_SEARCH_MIN_LENGTH) {
      return `Kamida ${AD_SEARCH_MIN_LENGTH} ta belgi kiriting`;
    }
    if (searching) {
      return (
        <span>
          <Spin size="small" /> Qidirilmoqda...
        </span>
      );
    }
    if (search.isError) {
      const status = getErrorStatus(search.error);
      if (isNetworkError(search.error) || (status !== undefined && status >= 500)) {
        return "Active Directory bilan ulanib bo'lmadi. Keyinroq urinib ko'ring yoki administratorga murojaat qiling";
      }
      return errorMessage(search.error, "AD dan qidirishda xatolik yuz berdi");
    }
    return 'Hech narsa topilmadi';
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

  const submit = () => void handleSubmit(onSubmit)();

  return (
    <Modal
      title={editingUser ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi'}
      open={open}
      onCancel={onClose}
      onOk={submit}
      confirmLoading={isSubmitting}
      okText="Saqlash"
      cancelText="Bekor qilish"
      destroyOnHidden
    >
      <Form layout="vertical" onFinish={submit}>
        <ImplicitSubmit />
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
                    // The same fields mean different things in each mode, so start clean.
                    setValue('username', '');
                    setValue('fullName', '');
                    setValue('password', '');
                    setSearchText('');
                    clearErrors();
                  }}
                />
              )}
            />
          </Form.Item>
        )}

        {isAdCreate ? (
          <FormField
            label="AD foydalanuvchi"
            required
            htmlFor="user-username"
            error={
              errors.username?.type === 'server'
                ? errors.username.message
                : errors.username || errors.fullName
                  ? 'AD dan foydalanuvchini tanlang'
                  : undefined
            }
          >
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <Select<AdSelectValue, AdOption>
                  id="user-username"
                  labelInValue
                  showSearch
                  allowClear
                  autoFocus
                  filterOption={false}
                  style={{ width: '100%' }}
                  placeholder="To'liq ism bo'yicha izlash..."
                  value={
                    field.value
                      ? { value: field.value, label: fullName || field.value }
                      : undefined
                  }
                  options={adOptions}
                  loading={searching}
                  notFoundContent={adNotFoundContent()}
                  onSearch={setSearchText}
                  onChange={(next) => {
                    const picked = next ? adOptions.find((o) => o.value === next.value) : undefined;
                    setValue('username', picked?.value ?? '', { shouldValidate: true });
                    setValue('fullName', picked?.label ?? '', { shouldValidate: true });
                  }}
                  optionRender={(option) => (
                    <div style={{ lineHeight: 1.3, padding: '2px 0' }}>
                      <div>{option.data.label}</div>
                      <div style={{ fontSize: 12, color: colors.textMuted }}>
                        @{option.data.value}
                        {option.data.registered ? " · allaqachon ro'yxatdan o'tgan" : ''}
                      </div>
                    </div>
                  )}
                />
              )}
            />
          </FormField>
        ) : (
          <>
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
                render={({ field }) => (
                  <Input
                    {...field}
                    id="user-username"
                    autoFocus={!editingUser}
                    autoComplete="off"
                    maxLength={64}
                    disabled={!!editingUser}
                  />
                )}
              />
            </FormField>

            <FormField label="F.I.Sh." required htmlFor="user-fullName" error={errors.fullName?.message}>
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => <Input {...field} id="user-fullName" maxLength={150} />}
              />
            </FormField>
          </>
        )}

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
