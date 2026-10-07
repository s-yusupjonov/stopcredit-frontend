import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Form, Input } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Navigate, useLocation } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { env } from '@/shared/config/env';
import { notifyError } from '@/shared/api/errorHandler';
import { FormField } from '@/shared/ui/FormField';
import agrobankMark from '@/assets/agrobank-mark.png';
import { useAuth } from './useAuth';
import styles from './LoginPage.module.css';

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Login kiritilishi shart').max(64, "Login 64 belgidan oshmasligi kerak"),
  password: z.string().min(1, 'Parol kiritilishi shart').max(128, 'Parol 128 belgidan oshmasligi kerak'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function redirectTarget(state: unknown): string | undefined {
  const from = (state as { from?: Location } | null)?.from;
  return from ? `${from.pathname}${from.search}` : undefined;
}

export function LoginPage() {
  const { login, isLoggingIn, isAuthenticated } = useAuth();
  const location = useLocation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login({ ...values, redirectTo: redirectTarget(location.state) });
    } catch (error) {
      notifyError(error, 'Login yoki parol noto\'g\'ri');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <img src={agrobankMark} alt="Agrobank" className={styles.logoChip} />
          <h1 className={styles.title}>{env.appName}</h1>
          <div className={styles.subtitle}>Tizimga kirish uchun ma'lumotlaringizni kiriting</div>
        </div>
        <Form layout="vertical" onFinish={() => void handleSubmit(onSubmit)()}>
          <FormField label="Login" htmlFor="login-username" error={errors.username?.message}>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="login-username"
                  size="large"
                  autoFocus
                  autoComplete="username"
                  prefix={<UserOutlined />}
                  placeholder="Login"
                />
              )}
            />
          </FormField>
          <FormField label="Parol" htmlFor="login-password" error={errors.password?.message}>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  id="login-password"
                  size="large"
                  autoComplete="current-password"
                  prefix={<LockOutlined />}
                  placeholder="Parol"
                />
              )}
            />
          </FormField>
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
