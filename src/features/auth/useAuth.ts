import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/shared/api/endpoints';
import type { LoginRequest } from '@/shared/api/types';
import { useAuthStore } from './authStore';

interface LoginVariables extends LoginRequest {
  /** Page the user originally asked for; AuthGuard passes it through the login redirect. */
  redirectTo?: string;
}

export function useAuth() {
  const { token, user, setSession, clearSession } = useAuthStore();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: LoginVariables) => authApi.login({ username, password }),
    onSuccess: (data, { redirectTo }) => {
      setSession(data.token, data.user);
      navigate(redirectTo && redirectTo.startsWith('/') ? redirectTo : '/', { replace: true });
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
