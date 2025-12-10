import {
	uniqueUsernameGenerator,
	type Config,
	adjectives,
	nouns,
	generateFromEmail
} from 'unique-username-generator';
import { PUBLIC_AUTH_URL } from './publicConstants';

const MAX_TRIES = 5;
const MIN_LENGTH = 5;
const MAX_LENGTH = 15;

function appendRandomDigits(username: string, digits: number): string {
	const randomDigits = Math.floor(Math.random() * Math.pow(10, digits))
		.toString()
		.padStart(digits, '0');
	return username + randomDigits;
}

export async function generateUsername(email?: string, tries = 0): Promise<string | undefined> {
	if (tries >= MAX_TRIES) return undefined;
	const config: Config = {
		dictionaries: [adjectives, nouns],
		separator: '',
		style: 'lowerCase',
		randomDigits: 3,
		length: MAX_LENGTH
	};

	if (email && tries < 3) {
		const digits = tries + 1;
		const slicedMail =
			email
				.slice(0, email.indexOf('@') > -1 ? email.indexOf('@') : email.length)
				.slice(0, MAX_LENGTH - digits) + '@gmail.com';
		const usernameFromEmail = generateFromEmail(slicedMail, digits).slice(0, MAX_LENGTH);

		const usernameFinal =
			usernameFromEmail.length < MIN_LENGTH
				? appendRandomDigits(usernameFromEmail, MIN_LENGTH - usernameFromEmail.length)
				: usernameFromEmail;

		return usernameFinal;
	} else {
		const randomUsername = uniqueUsernameGenerator(config).slice(0, MAX_LENGTH);
		const usernameFinal =
			randomUsername.length < MIN_LENGTH
				? appendRandomDigits(randomUsername, MIN_LENGTH - randomUsername.length)
				: randomUsername;

		return usernameFinal;
	}

	return generateUsername(email, tries + 1);
}

export function randomDigits(length: number): string {
	if (length === 1) {
		return (Math.floor(Math.random() * 8) + 2).toString(); // 2-9
	}
	const min = Math.pow(10, length - 1);
	const max = Math.pow(10, length) - 1;
	return Math.floor(Math.random() * (max - min + 1) + min).toString();
}

export const getRpId = () => {
	if (!PUBLIC_AUTH_URL) {
		console.error('PUBLIC_AUTH_URL is required');
		return null;
	}
	return getHostDomain(PUBLIC_AUTH_URL);
};

export const getHostDomain = (url: string): string | null => {
	try {
		const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;

		const parts = hostname.split('.');

		if (parts.length <= 2) return hostname;

		const knownSecondLevelTLDs = ['com.np', 'co.uk', 'com.au', 'co.jp', 'co.in'];

		const lastTwo = parts.slice(-2).join('.');
		const lastThree = parts.slice(-3).join('.');

		if (knownSecondLevelTLDs.includes(lastTwo)) {
			return parts.slice(-3).join('.');
		} else if (knownSecondLevelTLDs.includes(lastThree)) {
			return parts.slice(-4).join('.');
		} else {
			return parts.slice(-2).join('.');
		}
	} catch {
		return null;
	}
};
