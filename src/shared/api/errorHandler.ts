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

export function notifyError(error: unknown, fallback = 'Xatolik yuz berdi') {
  const problem = extractProblemDetail(error);
  notification.error({
    message: 'Xatolik',
    description: problem?.detail ?? fallback,
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
  notifyError(error, problem?.detail ?? fallback);
}
