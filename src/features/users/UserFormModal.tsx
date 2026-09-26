import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Form, Input, Modal, Select, Switch } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { UserResponse } from '@/shared/api/types';
import { roleLabels } from '@/shared/ui/strings';
import { handleFormError, notifyError } from '@/shared/api/errorHandler';
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
      if (!result.found) {
        setAdChecked('not-found');
        setValue('fullName', '', { shouldValidate: true });
        return;
      }
      if (result.alreadyRegistered) {
        setAdChecked('registered');
        return;
      }
      setValue('fullName', result.fullName ?? '', { shouldValidate: true });
      setAdChecked('found');
    } catch (error) {
      notifyError(error, "AD'dan qidirishda xatolik yuz berdi");
    }
  }

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (editingUser) {
        await updateMutation.mutateAsync({
          id: editingUser.id,
          payload: {
            username: values.username,
            fullName: values.fullName,
            role: values.role,
            active: values.active,
            ...(values.password ? { password: values.password } : {}),
          },
        });
      } else {
        await createMutation.mutateAsync({
          username: values.username,
          fullName: values.fullName,
          role: values.role,
          authSource: values.authSource,
          ...(values.authSource === 'LOCAL' ? { password: values.password ?? '' } : {}),
        });
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
      onOk={handleSubmit(onSubmit)}
      confirmLoading={isSubmitting}
      okText="Saqlash"
      cancelText="Bekor qilish"
      destroyOnClose
    >
      <Form layout="vertical">
        {isCreate && (
          <Form.Item label="Manba">
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

        <Form.Item
          label="Login"
          validateStatus={errors.username ? 'error' : ''}
          help={errors.username?.message}
        >
          <Controller
            name="username"
            control={control}
            render={({ field }) =>
              isAdCreate ? (
                <Input.Search
                  {...field}
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
                <Input {...field} />
              )
            }
          />
        </Form.Item>

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

        <Form.Item
          label="F.I.Sh."
          validateStatus={errors.fullName ? 'error' : ''}
          help={errors.fullName?.message}
        >
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <Input {...field} readOnly={isAdCreate} disabled={isAdCreate && adChecked !== 'found'} />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Rol"
          validateStatus={errors.role ? 'error' : ''}
          help={errors.role?.message}
        >
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={Object.entries(roleLabels).map(([value, label]) => ({ value, label }))}
              />
            )}
          />
        </Form.Item>

        {(!isCreate ? editingUser?.authSource !== 'AD' : authSource === 'LOCAL') && (
          <Form.Item
            label={editingUser ? "Parol (o'zgartirmaslik uchun bo'sh qoldiring)" : 'Parol'}
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => <Input.Password {...field} autoComplete="new-password" />}
            />
          </Form.Item>
        )}

        {editingUser && (
          <Form.Item label="Faol">
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} />
              )}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}