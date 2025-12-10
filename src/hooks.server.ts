import { sequence } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { auth } from '$lib/auth/server';
import { building } from '$app/environment';
import { TRUSTED_ORIGINS } from '$lib/utils/server/constants';

const CORS_HOSTNAMES = TRUSTED_ORIGINS.map((origin) => origin.trim()).map((origin) => {
	try {
		return new URL(origin).hostname.toLowerCase();
	} catch {
		return origin.toLowerCase();
	}
});

function isAllowedOrigin(origin: string | null): boolean {
	if (!origin) return false;

	try {
		const url = new URL(origin);
		if (!['http:', 'https:'].includes(url.protocol)) return false;

		const hostname = url.hostname.toLowerCase();

		// Wildcard allow all
		if (CORS_HOSTNAMES.includes('*')) return true;

		return CORS_HOSTNAMES.some((domain) => {
			// Wildcard subdomain match
			if (domain.startsWith('*.')) {
				const baseDomain = domain.slice(2);
				return hostname === baseDomain || hostname.endsWith(`.${baseDomain}`);
			}

			// Exact match
			return hostname === domain;
		});
	} catch {
		return false;
	}
}

// CORS configuration
const ALLOWED_METHODS = 'GET,DELETE,PATCH,POST,PUT,OPTIONS';
const ALLOWED_HEADERS = [
	'X-CSRF-Token',
	'X-Requested-With',
	'Accept',
	'Accept-Version',
	'Content-Length',
	'Content-MD5',
	'Content-Type',
	'Date',
	'X-Api-Version',
	'X-Captcha-Response'
].join(', ');

export const handle: Handle = sequence(Sentry.sentryHandle(), async ({ event, resolve }) => {
	const origin = event.request.headers.get('origin');
	const url = event.url.pathname;

	const isApi = url.startsWith('/api/');

	// ----------------------------------
	// Handle OPTIONS Preflight
	// ----------------------------------
	if (event.request.method === 'OPTIONS') {
		const headers: Record<string, string> = {
			'Access-Control-Allow-Methods': ALLOWED_METHODS,
			'Access-Control-Allow-Headers': ALLOWED_HEADERS,
			'Access-Control-Max-Age': '86400',
			Vary: 'Origin'
		};

		if (isAllowedOrigin(origin)) {
			headers['Access-Control-Allow-Origin'] = origin!;
			headers['Access-Control-Allow-Credentials'] = 'true';
		}

		return new Response(null, { status: 204, headers });
	}

	const start = Date.now();

	// ----------------------------------
	// Run main handler
	// ----------------------------------
	const response = await svelteKitHandler({ event, resolve, auth, building });

	// ----------------------------------
	// Add CORS headers
	// ----------------------------------
	if (isAllowedOrigin(origin)) {
		response.headers.set('Access-Control-Allow-Origin', origin!);
		response.headers.set('Access-Control-Allow-Credentials', 'true');
		response.headers.set('Vary', 'Origin');
	}

	// ----------------------------------
	// Log
	// ----------------------------------
	if (isApi) {
		const duration = Date.now() - start;
		const log = {
			duration,
			status: response.status,
			url,
			service: 'FH'
		};

		if (response.status >= 400)
			Sentry.logger.error(
				`FH [${event.request.method}] ${url} ${response.status} ${duration}ms`,
				log
			);
		else
			Sentry.logger.info(
				`FH [${event.request.method}] ${url} ${response.status} ${duration}ms`,
				log
			);
	}
	return response;
});

export const handleError = Sentry.handleErrorWithSentry();
