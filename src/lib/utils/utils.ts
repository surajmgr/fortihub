import { parse } from 'tldts';
import { PUBLIC_AUTH_URL } from './publicConstants';

export function getAuthURL(path?: string) {
	if (!PUBLIC_AUTH_URL) return '';
	if (!path) return PUBLIC_AUTH_URL;
	if (path.startsWith('/')) return `${PUBLIC_AUTH_URL}${path}`;
	if (path.startsWith('http')) return path;
	return `${PUBLIC_AUTH_URL}/${path}`;
}

export function getAuthCallbackURL(callbackUrl: string) {
	const currentHostURL = window.location.origin;
	return `${currentHostURL}/callback?redirectTo=${encodeURIComponent(callbackUrl)}`;
}

export async function handleAuthRedirect(callbackUrl: string) {
	const intermediateCallback = getAuthCallbackURL(callbackUrl);
	window.location.href = intermediateCallback;
}

export function isValidURL(url: string) {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

export function getHostURL(url: string) {
	try {
		return parse(url).domain;
	} catch {
		return 'Invalid URL';
	}
}

export function isSameDomain(url1: string | URL, url2: string | URL): boolean {
	const a = parse(url1 instanceof URL ? url1.origin : url1);
	const b = parse(url2 instanceof URL ? url2.origin : url2);

	return a.domain === b.domain && a.domain !== null;
}

export function handleGoBack() {
	window.history.back();
}
