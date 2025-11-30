import { z } from 'zod';

export const IsoDateString = z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
	message: 'Invalid date string'
});

export const roleSchema = z.enum(['user', 'admin', 'superadmin']).optional().nullable();
export const bookDifficultySchema = z
	.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
	.default('BEGINNER');
