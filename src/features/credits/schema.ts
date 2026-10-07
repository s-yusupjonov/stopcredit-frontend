import { z } from 'zod';
import { MAX_AMOUNT } from '@/shared/ui/MoneyInput';

const required = (max: number) =>
  z.string().trim().min(1, 'Majburiy maydon').max(max, `Ko'pi bilan ${max} ta belgi`);

export const creditSchema = z.object({
  firstName: required(100),
  lastName: required(100),
  middleName: z.string().trim().max(100, "Ko'pi bilan 100 ta belgi").optional().or(z.literal('')),
  pinfl: z.string().regex(/^\d{14}$/, 'PINFL 14 ta raqamdan iborat bo\'lishi kerak'),
  type: z.enum(['ONLINE', 'CHAKANA', 'OPEN'], { required_error: 'Majburiy maydon' }),
  mfo: required(25),
  applicationNumber: required(25),
  amount: z
    .number({ required_error: 'Majburiy maydon', invalid_type_error: 'Majburiy maydon' })
    .positive('Summa musbat bo\'lishi kerak')
    .max(MAX_AMOUNT, 'Summa juda katta')
    .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, 'Ko\'pi bilan 2 ta kasr xona'),
  status: z.enum(['ACTIVE', 'STOPPED'], { required_error: 'Majburiy maydon' }),
});

export type CreditFormValues = z.infer<typeof creditSchema>;
