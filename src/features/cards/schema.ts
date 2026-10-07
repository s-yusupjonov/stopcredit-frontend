import { z } from 'zod';
import { MAX_AMOUNT } from '@/shared/ui/MoneyInput';

export const cardSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, "Karta raqami 16 ta raqamdan iborat bo'lishi kerak"),
  mfo: z.string().trim().max(10, 'Ko\'pi bilan 10 ta belgi').optional().or(z.literal('')),
  restrictionDate: z.string().optional().or(z.literal('')),
  balance: z
    .number({ invalid_type_error: 'Noto\'g\'ri qiymat' })
    .min(-MAX_AMOUNT, 'Summa juda katta')
    .max(MAX_AMOUNT, 'Summa juda katta')
    .nullable()
    .optional(),
  restrictionType: z.enum(['FULL', 'PARTIAL']).nullable().optional(),
  basisCategory: z.enum(['CENTRAL_BANK', 'INTERNAL_AFFAIRS', 'OTHER'], {
    required_error: 'Majburiy maydon',
  }),
  basisComment: z.string().trim().max(500, "Ko'pi bilan 500 ta belgi").optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'BLOCKED'], { required_error: 'Majburiy maydon' }),
  statusComment: z.string().trim().max(500, "Ko'pi bilan 500 ta belgi").optional().or(z.literal('')),
  executorId: z.number({
    required_error: 'Majburiy maydon',
    invalid_type_error: 'Majburiy maydon',
  }),
});

export type CardFormValues = z.infer<typeof cardSchema>;

export const unblockSchema = z.object({
  orderNumber: z.string().trim().min(1, 'Majburiy maydon').max(500, 'Ko\'pi bilan 500 ta belgi'),
  comment: z.string().trim().max(500, 'Ko\'pi bilan 500 ta belgi').optional().or(z.literal('')),
  file: z.instanceof(File, { message: 'Buyruq faylini yuklang' }),
});

export type UnblockFormValues = z.infer<typeof unblockSchema>;