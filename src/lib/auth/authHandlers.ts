'use client';

import {
	authSessionResponseSchema,
	checkHasPasswordResponseSchema,
	checkHasPasswordSchema,
	setPasswordSchema,
	updateConsentSchema,
	updateConsentResponseSchema
} from '$lib/schema/auth';
import { apiEndpoints } from '$lib/utils/apiEndpoints';
import { getAuthCallbackURL, handleAuthRedirect } from '$lib/utils/utils';
import { asyncHandlerClient, createApiHandler } from '../utils/handler';
import { authClient } from './authClient';
import { ALLOWED_SOCIAL_PROVIDERS, type SocialProvider } from '$lib/utils/publicConstants';

// Sign in with email and password
export const signInWithPassword = asyncHandlerClient(
	async (args: { email: string; password: string; callbackUrl?: string }) => {
		const { email, password, callbackUrl = '/' } = args;
		const { data, error } = await authClient.signIn.email({
			email,
			password
		});

		if (error) {
			throw error;
		}

		if (data) {
			await handleAuthRedirect(callbackUrl);
		}

		return data;
	},
	'signInWithPassword'
);

// Sign up with email and password
export const signUpWithPassword = asyncHandlerClient(
	async (args: {
		email: string;
		password: string;
		name?: string;
		callbackUrl?: string;
	}) => {
		const { email, password, name, callbackUrl = '/' } = args;
		const { data, error } = await authClient.signUp.email({
			email,
			password,
			name: name || email.split('@')[0]
		});

		if (error) {
			throw error;
		}

		if (data) {
			await handleAuthRedirect(callbackUrl);
		}

		return data;
	},
	'signUpWithPassword'
);

// Change password
export const changePassword = asyncHandlerClient(
	async (args: { currentPassword: string; newPassword: string; revokeOtherSessions?: boolean }) => {
		const { currentPassword, newPassword, revokeOtherSessions = false } = args;

		const { data, error } = await authClient.changePassword({
			currentPassword,
			newPassword,
			revokeOtherSessions
		});

		if (error) {
			throw error;
		}

		return data;
	},
	'changePassword'
);

// Send Verification OTP
export const sendVerificationOTP = asyncHandlerClient(
	async (args: {
		email: string;
		type: 'sign-in' | 'email-verification' | 'forget-password';
		turnstileToken: string;
	}) => {
		const { email, type, turnstileToken: turnstrileToken } = args;
		const { data, error } = await authClient.emailOtp.sendVerificationOtp({
			email,
			type,
			fetchOptions: {
				headers: {
					'x-captcha-response': turnstrileToken
				}
			}
		});

		if (error) {
			throw error;
		}

		return data;
	},
	'sendVerificationOTP'
);

// Sign In with Email OTP
export const signInWithEmailOTP = asyncHandlerClient(
	async (args: { email: string; otp: string; callbackUrl?: string; turnstileToken: string }) => {
		const { email, otp, callbackUrl = '/' } = args;
		const { data, error } = await authClient.signIn.emailOtp({
			email,
			otp,
			fetchOptions: {
				headers: {
					'x-captcha-response': args.turnstileToken
				}
			}
		});

		if (error) {
			throw error;
		}

		return data;
	},
	'signInWithEmailOTP'
);

// Verify Email with OTP
export const verifyEmailWithOTP = asyncHandlerClient(
	async (args: { email: string; otp: string; callbackUrl?: string }) => {
		const { email, otp, callbackUrl = '/' } = args;
		const { data, error } = await authClient.emailOtp.verifyEmail({
			email,
			otp
		});

		if (error) {
			throw error;
		}

		if (data) {
			await handleAuthRedirect(callbackUrl);
		}

		return data;
	},
	'verifyEmailWithOTP'
);

// Send Forget Password OTP
export const sendForgetPasswordOTP = asyncHandlerClient(async (args: { email: string }) => {
	const { email } = args;
	const { data, error } = await authClient.forgetPassword.emailOtp({
		email
	});

	if (error) {
		throw error;
	}

	return data;
}, 'sendForgetPasswordOTP');

// Reset Password with OTP
export const resetPasswordWithOTP = asyncHandlerClient(
	async (args: { email: string; otp: string; password: string; callbackUrl?: string }) => {
		const { email, otp, password, callbackUrl = '/login' } = args;
		const { data, error } = await authClient.emailOtp.resetPassword({
			email,
			otp,
			password
		});

		if (error) {
			throw error;
		}

		if (data) {
			await handleAuthRedirect(callbackUrl);
		}

		return data;
	},
	'resetPasswordWithOTP'
);

// Request Password Reset (Link)
export const requestPasswordReset = asyncHandlerClient(
	async (args: { email: string; redirectTo: string }) => {
		const { email, redirectTo } = args;
		const { data, error } = await authClient.requestPasswordReset({
			email,
			redirectTo
		});

		if (error) {
			throw error;
		}

		return data;
	},
	'requestPasswordReset'
);

// Reset Password (Link)
export const resetPassword = asyncHandlerClient(
	async (args: { newPassword: string; token: string }) => {
		const { newPassword, token } = args;
		const { data, error } = await authClient.resetPassword({
			newPassword,
			token
		});

		if (error) {
			throw error;
		}

		return data;
	},
	'resetPassword'
);

// Handle Magic Link Sign In
export const handleMagicLinkSignIn = asyncHandlerClient(
	async (args: { email: string; callbackUrl?: string }) => {
		const { email, callbackUrl = '/' } = args;
		const { data, error } = await authClient.signIn.magicLink({
			email,
			callbackURL: getAuthCallbackURL(callbackUrl)
		});

		if (error) {
			throw error;
		}

		return data;
	},
	'handleMagicLinkSignIn'
);

export const handleSocialSignIn = asyncHandlerClient(
	async (args: { provider: SocialProvider; callbackUrl?: string }) => {
		const { provider, callbackUrl = '/' } = args;

		if (!ALLOWED_SOCIAL_PROVIDERS.includes(provider)) {
			throw new Error('Invalid provider');
		}

		if (provider === 'passkey') return handlePassKeySignIn({ callbackUrl });
		else if (provider === 'anonymous') return handleAnonymousSignIn({ callbackUrl });

		const { data, error } = await authClient.signIn.social({
			provider,
			callbackURL: getAuthCallbackURL(callbackUrl)
		});

		if (error) throw error;

		return data;
	},
	'handleSocialSignIn'
);

// Passkey Sign In
export const handlePassKeySignIn = asyncHandlerClient(async (args: { callbackUrl?: string }) => {
	const { callbackUrl = '/' } = args;
	const { data, error } = await authClient.signIn.passkey();

	if (error) {
		throw error;
	}

	if (data) {
		await handleAuthRedirect(callbackUrl);
	}

	return data;
}, 'handlePassKeySignIn');

// Anonymous Sign In
export const handleAnonymousSignIn = asyncHandlerClient(async (args: { callbackUrl?: string }) => {
	const { callbackUrl = '/' } = args;
	const { data, error } = await authClient.signIn.anonymous();

	if (error) {
		throw error;
	}

	if (data) {
		await handleAuthRedirect(callbackUrl);
	}

	return data;
}, 'handleAnonymousSignIn');

export const getSession = createApiHandler({
	method: 'GET',
	path: apiEndpoints.auth.getSession(),
	output: authSessionResponseSchema,
	wrapper: 'non-standard',
	auth: true
});
export type GetSessionResponse = Awaited<ReturnType<typeof getSession>>;

export const checkHasPassword = createApiHandler({
	method: 'POST',
	path: apiEndpoints.auth.checkHasPassword(),
	input: checkHasPasswordSchema,
	output: checkHasPasswordResponseSchema
});

export const setPassword = createApiHandler({
	method: 'POST',
	path: apiEndpoints.auth.setPassword(),
	input: setPasswordSchema,
	auth: true
});

export const updateConsent = createApiHandler({
	method: 'POST',
	path: apiEndpoints.auth.updateConsent(),
	input: updateConsentSchema,
	output: updateConsentResponseSchema,
	auth: true
});
