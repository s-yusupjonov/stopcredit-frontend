import { create } from 'zustand';
import type { UserResponse } from '@/shared/api/types';

const TOKEN_KEY = 'stopcredit_token';
const USER_KEY = 'stopcredit_user';

interface AuthState {
  token: string | null;
  user: UserResponse | null;
  setSession: (token: string, user: UserResponse) => void;
  clearSession: () => void;
}

function loadUser(): UserResponse | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserResponse;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(TOKEN_KEY),
  user: loadUser(),
  setSession: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ token, user });
  },
  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ token: null, user: null });
  },
}));

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
