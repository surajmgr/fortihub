export type OTPEmailType = 'sign-in' | 'email-verification' | 'forget-password' | 'magic-link';

export interface SendOTPEmailParams {
	email: string;
	otp: string;
	type: OTPEmailType;
}
