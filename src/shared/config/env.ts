function readString(name: string, value: string | undefined, fallback?: string): string {
  const trimmed = value?.trim();
  if (trimmed) return trimmed;
  if (fallback !== undefined) return fallback;
  throw new Error(`${name} o'zgaruvchisi berilmagan. .env faylini yoki build argumentini tekshiring.`);
}

function readPositiveNumber(name: string, value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === '') return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} musbat son bo'lishi kerak (berilgan: "${value}")`);
  }
  return parsed;
}

export const env = {
  apiBaseUrl: readString('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL),
  appName: readString('VITE_APP_NAME', import.meta.env.VITE_APP_NAME, 'StopCredit'),
  reviewDeadlineDays: readPositiveNumber(
    'VITE_REVIEW_DEADLINE_DAYS',
    import.meta.env.VITE_REVIEW_DEADLINE_DAYS,
    3,
  ),
  maxUploadSizeMb: readPositiveNumber(
    'VITE_MAX_UPLOAD_SIZE_MB',
    import.meta.env.VITE_MAX_UPLOAD_SIZE_MB,
    20,
  ),
} as const;
