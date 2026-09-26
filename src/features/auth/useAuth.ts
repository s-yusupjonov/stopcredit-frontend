import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/shared/api/endpoints';
import type { LoginRequest } from '@/shared/api/types';
import { useAuthStore } from './authStore';

export function useAuth() {
  const { token, user, setSession, clearSession } = useAuthStore();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
    onSuccess: (data) => {
      setSession(data.token, data.user);
      navigate('/', { replace: true });
    },
  });

  const logout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  return {
    token,
    user,
    role: user?.role ?? null,
    isAuthenticated: !!token && !!user,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout,
  };
}
