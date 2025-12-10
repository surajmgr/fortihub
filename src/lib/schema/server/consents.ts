import { z } from 'zod';

export const updateConsentSchema = z.object({
	key: z.string(),
	value: z.string()
});

export type UpdateConsentSchema = z.infer<typeof updateConsentSchema>;
