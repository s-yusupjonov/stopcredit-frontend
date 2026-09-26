export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  appName: import.meta.env.VITE_APP_NAME,
  reviewDeadlineDays: Number(import.meta.env.VITE_REVIEW_DEADLINE_DAYS),
  maxUploadSizeMb: Number(import.meta.env.VITE_MAX_UPLOAD_SIZE_MB),
} as const;
