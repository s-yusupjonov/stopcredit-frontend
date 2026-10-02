import dayjs from 'dayjs';

export function formatMoney(amount: number): string {
  const parts = amount.toFixed(2).split('.');
  const wholePart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${wholePart},${parts[1]} so'm`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return dayjs(value).format('DD.MM.YYYY HH:mm');
}

export function formatDateShort(value: string | null | undefined): string {
  if (!value) return '—';
  return dayjs(value).format('DD.MM.YYYY');
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatRemainingTime(deadline: string | null): string {
  if (!deadline) return '';
  const now = dayjs();
  const end = dayjs(deadline);
  const diffMinutes = end.diff(now, 'minute');
  if (diffMinutes <= 0) return 'Muddati o\'tgan';
  const days = Math.floor(diffMinutes / (60 * 24));
  const hours = Math.floor((diffMinutes % (60 * 24)) / 60);
  if (days > 0) return `${days} kun ${hours} soat qoldi`;
  const minutes = diffMinutes % 60;
  if (hours > 0) return `${hours} soat ${minutes} daqiqa qoldi`;
  return `${minutes} daqiqa qoldi`;
}

export function formatOverdueTime(deadline: string | null): string {
  if (!deadline) return '';
  const now = dayjs();
  const end = dayjs(deadline);
  const diffMinutes = now.diff(end, 'minute');
  if (diffMinutes <= 0) return '';
  const days = Math.floor(diffMinutes / (60 * 24));
  const hours = Math.floor((diffMinutes % (60 * 24)) / 60);
  if (days > 0) return `${days} kun ${hours} soat`;
  const minutes = diffMinutes % 60;
  return `${hours} soat ${minutes} daqiqa`;
}

export function formatCardNumber(value: string): string {
  return value.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatExecutor(executor: { name: string; phone: string; extension: string }): string {
  const phone = executor.phone ? ` ${executor.phone}` : '';
  const extension = executor.extension ? ` (${executor.extension})` : '';
  return `${executor.name}${phone}${extension}`;
}
