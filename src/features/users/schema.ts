import { z } from 'zod';

export const userSchema = z.object({
  authSource: z.enum(['LOCAL', 'AD']),
  username: z.string().trim().min(1, 'Majburiy maydon').max(64, "Ko'pi bilan 64 ta belgi"),
  fullName: z.string().min(1, 'Majburiy maydon').max(150),
  role: z.enum(['ADMIN', 'ANTI_FRAUD', 'CREDIT_MANAGEMENT', 'LEGAL', 'UNDERWRITING', 'MANAGEMENT'], {
    required_error: 'Majburiy maydon',
  }),
  password: z.string().optional(),
  active: z.boolean(),
});

export type UserFormValues = z.infer<typeof userSchema>;

export function buildUserSchema(isCreate: boolean) {
  return userSchema.superRefine((data, ctx) => {
    const passwordRequired = isCreate && data.authSource === 'LOCAL';

    if (data.password && data.password.length > 72) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password'],
        message: "Parol ko'pi bilan 72 ta belgidan iborat bo'lishi kerak",
      });
    }
    if (passwordRequired && (!data.password || data.password.length < 6)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password'],
        message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak',
      });
    }
    if (!passwordRequired && data.password && data.password.length > 0 && data.password.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password'],
        message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak',
      });
    }
    if (isCreate && data.authSource === 'AD' && !data.fullName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fullName'],
        message: "AD dan qidirib, F.I.Sh.ni to'ldiring",
      });
    }
  });
}