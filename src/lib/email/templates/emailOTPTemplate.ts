import type { OTPEmailType } from '$lib/types/email';

interface EmailOTPTemplateProps {
	otp: string;
	type: OTPEmailType;
	title: string;
}

export function generateEmailOTPTemplate({ otp, type, title }: EmailOTPTemplateProps) {
	const previewText = getPreviewText(type, otp);
	const description = getDescription(type);
	const year = new Date().getFullYear();

	return `
	<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title>${title}</title>
		</head>
		<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin:0; padding:0;">
			<!-- Preview Text -->
			<div style="display:none; max-height:0; overflow:hidden;">${previewText}</div>

			<!-- Container -->
			<table width="100%" cellpadding="0" cellspacing="0" border="0">
				<tr>
					<td align="center">
						<table style="background-color: #ffffff; margin:0 auto 64px; padding:20px 0 48px; border-radius:8px; max-width:600px;" width="600" cellpadding="0" cellspacing="0" border="0">
							<!-- Heading -->
							<tr>
								<td style="font-size:32px; line-height:1.3; font-weight:700; text-align:center; color:#484848; margin:30px 0;">
									${title}
								</td>
							</tr>

							<!-- Description -->
							<tr>
								<td style="font-size:16px; line-height:24px; color:#484848; text-align:center; margin:16px 40px;">
									${description}
								</td>
							</tr>

							<!-- OTP -->
							<tr>
								<td>
									<table style="background:#f4f4f5; border-radius:8px; margin:32px auto; padding:24px; text-align:center; max-width:400px;" width="400" cellpadding="0" cellspacing="0" border="0">
										<tr>
											<td style="font-size:36px; font-weight:700; letter-spacing:8px; color:#7c3aed; margin:0; font-family:monospace;">
												${otp}
											</td>
										</tr>
									</table>
								</td>
							</tr>

							<!-- Expiry -->
							<tr>
								<td style="font-size:16px; line-height:24px; color:#484848; text-align:center; margin:16px 40px;">
									This code will expire in <strong>5 minutes</strong>.
								</td>
							</tr>

							<!-- Ignore -->
							<tr>
								<td style="font-size:16px; line-height:24px; color:#484848; text-align:center; margin:16px 40px;">
									If you didn't request this code, please ignore this email.
								</td>
							</tr>

							<!-- Footer -->
							<tr>
								<td style="margin:32px 0 0; text-align:center; font-size:14px; color:#9ca3af;">
									© ${year} Auth. All rights reserved.
								</td>
							</tr>

						</table>
					</td>
				</tr>
			</table>
		</body>
	</html>
	`;
}

// Helper functions
function getPreviewText(type: OTPEmailType, otp: string): string {
	switch (type) {
		case 'sign-in':
			return `Your sign-in code is ${otp}`;
		case 'email-verification':
			return `Your verification code is ${otp}`;
		case 'forget-password':
			return `Your password reset code is ${otp}`;
		case 'magic-link':
			return `Your magic link is ${otp}`;
		default:
			return `Your verification code is ${otp}`;
	}
}

function getDescription(type: OTPEmailType): string {
	switch (type) {
		case 'sign-in':
			return 'Use the following code to sign in to your account:';
		case 'email-verification':
			return 'Use the following code to verify your email address:';
		case 'forget-password':
			return 'Use the following code to reset your password:';
		case 'magic-link':
			return 'Use the following link to sign in to your account:';
		default:
			return 'Use the following verification code:';
	}
}
