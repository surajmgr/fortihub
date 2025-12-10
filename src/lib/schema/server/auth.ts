import { z } from 'zod';

export const checkHasPasswordSchema = z.object({
	email: z.email()
});
export type CheckHasPasswordSchema = z.infer<typeof checkHasPasswordSchema>;

export const setPasswordSchema = z.object({
	newPassword: z.string().min(8)
});
export type SetPasswordSchema = z.infer<typeof setPasswordSchema>;
