import type {
  CardBasisCategory,
  CardDocumentKind,
  CardRestrictionType,
  CardStatus,
  CreditStage,
  CreditStatus,
  CreditType,
  Role,
} from '@/shared/api/types';

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

export const cardStatusLabels: Record<CardStatus, string> = {
  ACTIVE: 'Aktiv',
  BLOCKED: 'Bloklangan',
};

export const cardRestrictionLabels: Record<CardRestrictionType, string> = {
  FULL: "To'liq",
  PARTIAL: 'Qisman',
};

export const cardBasisLabels: Record<CardBasisCategory, string> = {
  CENTRAL_BANK: 'Markaziy Bank',
  INTERNAL_AFFAIRS: 'Ichki Ishlar Vazirligi',
  OTHER: 'Boshqa',
};

export const cardDocumentKindLabels: Record<CardDocumentKind, string> = {
  RESTRICTION: 'Cheklov hujjati',
  UNBLOCK: 'Blokdan ochish buyrug\'i',
};