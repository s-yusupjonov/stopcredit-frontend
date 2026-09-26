import { z } from 'zod';

export const creditSchema = z.object({
  firstName: z.string().min(1, 'Majburiy maydon').max(100),
  lastName: z.string().min(1, 'Majburiy maydon').max(100),
  middleName: z.string().max(100).optional().or(z.literal('')),
  pinfl: z.string().regex(/^\d{14}$/, 'PINFL 14 ta raqamdan iborat bo\'lishi kerak'),
  type: z.enum(['ONLINE', 'CHAKANA', 'OPEN'], { required_error: 'Majburiy maydon' }),
  mfo: z.string().min(1, 'Majburiy maydon').max(25),
  applicationNumber: z.string().min(1, 'Majburiy maydon').max(25),
  amount: z
    .number({ invalid_type_error: 'Summa kiritilishi shart' })
    .positive('Summa musbat bo\'lishi kerak')
    .refine((v) => Math.round(v * 100) === v * 100, 'Ko\'pi bilan 2 ta kasr xona'),
  status: z.enum(['ACTIVE', 'STOPPED'], { required_error: 'Majburiy maydon' }),
});

export type CreditFormValues = z.infer<typeof creditSchema>;