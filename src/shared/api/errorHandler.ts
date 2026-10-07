import { notification } from 'antd';
import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';
import type { ProblemDetail } from './types';

function isProblemDetail(data: unknown): data is ProblemDetail {
  return typeof data === 'object' && data !== null && 'detail' in data;
}

export function extractProblemDetail(error: unknown): ProblemDetail | null {
  const maybeAxios = error as { response?: { data?: unknown } };
  const data = maybeAxios?.response?.data;
  if (isProblemDetail(data)) return data;
  return null;
}

/** HTTP status (javob kelmagan bo'lsa undefined — tarmoq xatosi). */
export function getErrorStatus(error: unknown): number | undefined {
  return (error as { response?: { status?: number } })?.response?.status;
}

export function isNetworkError(error: unknown): boolean {
  const e = error as { response?: unknown; request?: unknown; code?: string };
  return !e?.response && (!!e?.request || e?.code === 'ERR_NETWORK');
}

function statusMessage(status: number | undefined, network: boolean): string | null {
  if (network) return "Server bilan aloqa yo'q. Internet yoki serverni tekshiring";
  switch (status) {
    case 400:
      return "So'rov noto'g'ri yuborildi";
    case 403:
      return "Sizda bu amalni bajarish huquqi yo'q";
    case 404:
      return 'Ma\'lumot topilmadi';
    case 409:
      return "Ma'lumot boshqa amal bilan to'qnashdi. Sahifani yangilab qayta urinib ko'ring";
    case 413:
      return 'Fayl hajmi juda katta';
    case 429:
      return "Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring";
    default:
      return status !== undefined && status >= 500 ? 'Server xatosi. Keyinroq qayta urinib ko\'ring' : null;
  }
}

export function errorMessage(error: unknown, fallback = 'Xatolik yuz berdi'): string {
  const problem = extractProblemDetail(error);
  if (problem?.detail) return problem.detail;
  return statusMessage(getErrorStatus(error), isNetworkError(error)) ?? fallback;
}

export function notifyError(error: unknown, fallback = 'Xatolik yuz berdi') {
  notification.error({
    message: 'Xatolik',
    description: errorMessage(error, fallback),
  });
}

export function handleFormError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fallback = 'Xatolik yuz berdi',
): void {
  const problem = extractProblemDetail(error);
  if (problem?.errors && Object.keys(problem.errors).length > 0) {
    Object.entries(problem.errors).forEach(([field, message]) => {
      setError(field as Path<T>, { type: 'server', message });
    });
    return;
  }
  notifyError(error, fallback);
}
