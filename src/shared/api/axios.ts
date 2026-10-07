import axios from 'axios';
import { env } from '@/shared/config/env';
import { getStoredToken, useAuthStore } from '@/features/auth/authStore';

export const api = axios.create({
  baseURL: env.apiBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * responseType: 'blob' bo'lgan so'rovlarda server xatosi ham Blob bo'lib keladi.
 * Uni ProblemDetail JSON ga aylantiramiz, shunda xato xabarini ko'rsatish mumkin.
 */
async function unwrapBlobError(error: unknown): Promise<void> {
  const response = (error as { response?: { data?: unknown } })?.response;
  if (!response || !(response.data instanceof Blob)) return;
  try {
    const text = await response.data.text();
    response.data = JSON.parse(text);
  } catch {
    response.data = undefined;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    await unwrapBlobError(error);
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
