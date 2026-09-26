import { useForm, useController, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Form, Input } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { env } from '@/shared/config/env';
import { notifyError } from '@/shared/api/errorHandler';
import agrobankMark from '@/assets/agrobank-mark.png';
import { useAuth } from './useAuth';
import styles from './LoginPage.module.css';

const loginSchema = z.object({
  username: z.string().min(1, 'Login kiritilishi shart'),
  password: z.string().min(1, 'Parol kiritilishi shart'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function ControlledInput({
  name,
  control,
  isPassword,
}: {
  name: keyof LoginFormValues;
  control: Control<LoginFormValues>;
  isPassword?: boolean;
}) {
  const { field } = useController({ name, control });
  const Component = isPassword ? Input.Password : Input;
  return (
    <Component
      {...field}
      size="large"
      prefix={isPassword ? <LockOutlined /> : <UserOutlined />}
      placeholder={isPassword ? 'Parol' : 'Login'}
    />
  );
}

export function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
    } catch (error) {
      notifyError(error, 'Login yoki parol noto\'g\'ri');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <img src={agrobankMark} alt="Agrobank" className={styles.logoChip} />
          <div className={styles.title}>{env.appName}</div>
          <div className={styles.subtitle}>Tizimga kirish uchun ma'lumotlaringizni kiriting</div>
        </div>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label="Login"
            validateStatus={errors.username ? 'error' : ''}
            help={errors.username?.message}
          >
            <ControlledInput name="username" control={control} />
          </Form.Item>
          <Form.Item
            label="Parol"
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password?.message}
          >
            <ControlledInput name="password" control={control} isPassword />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={isLoggingIn}
            style={{ marginTop: 8 }}
          >
            Kirish
          </Button>
        </Form>
      </div>
    </div>
  );
}