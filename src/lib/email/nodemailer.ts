import {
	SMTP_HOST,
	SMTP_USER,
	SMTP_PASS,
	SMTP_PORT,
	SMTP_SECURE,
	EMAIL_FROM,
	EMAIL_FROM_NAME
} from '$lib/utils/server/constants';
import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
	if (!transporter) {
		if (
			!SMTP_HOST ||
			!SMTP_USER ||
			!SMTP_PASS ||
			!SMTP_PORT ||
			!SMTP_SECURE ||
			!EMAIL_FROM ||
			!EMAIL_FROM_NAME
		) {
			throw new Error(
				'Email configuration is missing. Required variables are SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT, SMTP_SECURE, EMAIL_FROM, EMAIL_FROM_NAME'
			);
		}

		transporter = nodemailer.createTransport({
			host: SMTP_HOST,
			port: Number(SMTP_PORT),
			secure: SMTP_SECURE === 'true',
			auth: {
				user: SMTP_USER,
				pass: SMTP_PASS
			}
		});
	}
	return transporter;
}

export async function sendEmail({
	to,
	subject,
	text,
	html
}: {
	to: string;
	subject: string;
	text?: string;
	html?: string;
}) {
	const mailer = getTransporter();

	await mailer.sendMail({
		from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
		to,
		subject,
		text,
		html
	});
}
