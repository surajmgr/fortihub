import z from 'zod';
import { IsoDateString, roleSchema } from './common';

const sessionSchema = z.object({
	id: z.string(),
	token: z.string(),
	userId: z.string(),
	expiresAt: IsoDateString,
	createdAt: IsoDateString,
	updatedAt: IsoDateString,
	ipAddress: z.string().optional(),
	userAgent: z.string().optional(),
	timezone: z.string().optional(),
	city: z.string().optional(),
	country: z.string().optional(),
	region: z.string().optional(),
	regionCode: z.string().optional(),
	colo: z.string().optional(),
	latitude: z.string().optional(),
	longitude: z.string().optional()
});

const userSchema = z.object({
	id: z.string(),
	name: z.string().optional().nullable(),
	email: z.string().optional().nullable(),
	emailVerified: z.boolean().optional().nullable(),
	image: z.string().optional().nullable(),
	username: z.string().optional().nullable(),
	displayUsername: z.string().optional().nullable(),
	isAnonymous: z.boolean().nullable().optional(),
	role: roleSchema,
	twoFactorEnabled: z.boolean().optional().nullable(),
	createdAt: IsoDateString,
	updatedAt: IsoDateString
});

export const authSessionResponseSchema = z
	.object({
		session: sessionSchema,
		user: userSchema.nullable()
	})
	.nullable();

export type AuthSessionResponseSchema = z.infer<typeof authSessionResponseSchema>;

export const checkHasPasswordSchema = z.object({
	email: z.email()
});
export const checkHasPasswordResponseSchema = z.boolean();

export const setPasswordSchema = z.object({
	newPassword: z.string()
});

export type CheckHasPasswordSchema = z.infer<typeof checkHasPasswordSchema>;
export type SetPasswordSchema = z.infer<typeof setPasswordSchema>;

export const emailSchema = z.object({
	email: z.email('Please enter a valid email address')
});

export const passwordSchema = z.object({
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.max(100, 'Password is too long')
});

export const signUpPasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.max(100, 'Password is too long'),
		confirmPassword: z.string()
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword']
	});

export const otpSchema = z.object({
	otp: z.string().length(6, 'Please enter the complete 6-digit code')
});

export type EmailFormData = z.infer<typeof emailSchema>;
export type PasswordFormData = z.infer<typeof passwordSchema>;
export type SignUpPasswordFormData = z.infer<typeof signUpPasswordSchema>;
export type OTPFormData = z.infer<typeof otpSchema>;
