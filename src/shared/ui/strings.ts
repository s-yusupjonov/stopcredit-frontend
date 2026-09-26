import type { CreditStage, CreditStatus, CreditType, Role } from '@/shared/api/types';

export const stageLabels: Record<CreditStage, string> = {
  ANTI_FRAUD: 'Anti-fraud',
  CREDIT_MANAGEMENT: 'Kredit boshqaruvi',
  LEGAL: 'Yuridik bo\'lim',
  UNDERWRITING: 'Muammoli Kreditlar',
  COMPLETED: 'Yakunlangan',
};

export const statusLabels: Record<CreditStatus, string> = {
  ACTIVE: 'Faol',
  STOPPED: 'To\'xtatilgan',
};

export const typeLabels: Record<CreditType, string> = {
  ONLINE: 'Onlayn',
  CHAKANA: 'Chakana',
  OPEN: 'Ochiq',
};

export const roleLabels: Record<Role, string> = {
  ADMIN: 'Administrator',
  ANTI_FRAUD: 'Anti-fraud',
  CREDIT_MANAGEMENT: 'Kreditlarni boshqarish',
  LEGAL: 'Yuridik bo\'lim',
  UNDERWRITING: 'Muammoli kreditlar bilan ishlash',
  MANAGEMENT: 'Rahbariyat',
};

export const stageOrder: CreditStage[] = [
  'ANTI_FRAUD',
  'CREDIT_MANAGEMENT',
  'LEGAL',
  'UNDERWRITING',
  'COMPLETED',
];