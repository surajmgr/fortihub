import { TRUSTED_ORIGINS } from './constants';
import ApiError from './apiError';

export function dbAsyncHandler<TArgs, TResult>(dbOperation: (args: TArgs) => Promise<TResult>, operationName?: string) {
	return async (args: TArgs): Promise<TResult> => {
		try {
			return await dbOperation(args);
		} catch (error) {
			console.error(`Database error in ${operationName || "operation"}:`, error);

			if (error instanceof Error) {
				if (error.message.includes("ECONNREFUSED")) {
					throw new Error(`Database connection failed in ${operationName || "operation"}`);
				}
				if (error.message.includes("duplicate key")) {
					throw new Error(`Duplicate entry in ${operationName || "operation"}`);
				}
				if (error.message.includes("foreign key constraint")) {
					throw new Error(`Invalid reference in ${operationName || "operation"}`);
				}
			}

			throw new Error(`Database operation failed: ${operationName || "unknown operation"}`);
		}
	};
}

const CORS_ROOT_DOMAINS = TRUSTED_ORIGINS.map(origin => origin.trim())
	.filter(o => o.startsWith("http://") || o.startsWith("https://") || /^[\w.*-]+$/.test(o))
	.map(o => {
		try {
			const url = new URL(o);
			return url.hostname.toLowerCase();
		} catch {
			return o.toLowerCase();
		}
	});

function isAllowedOrigin(origin: string | null) {
	if (!origin) return false;
	try {
		const url = new URL(origin);
		const hostname = url.hostname.toLowerCase();

		if (url.protocol !== "http:" && url.protocol !== "https:") return false;

		return CORS_ROOT_DOMAINS.some(domain => {
			if (domain.startsWith("*.")) {
				const wildcardBase = domain.slice(2);
				return hostname === wildcardBase || hostname.endsWith("." + wildcardBase);
			}
			return hostname === domain;
		});
	} catch {
		return false;
	}
}
/* eslint-disable @typescript-eslint/no-explicit-any */
export function apiAsyncHandler<TArgs extends any[], TResult>(
	handler: (...args: TArgs) => Promise<TResult>,
	routeName?: string
) {
	const defaultStatus = 500;

	// Standard CORS constants
	const ALLOWED_METHODS = "GET,DELETE,PATCH,POST,PUT,OPTIONS";
	const ALLOWED_HEADERS = [
		"X-CSRF-Token",
		"X-Requested-With",
		"Accept",
		"Accept-Version",
		"Content-Length",
		"Content-MD5",
		"Content-Type",
		"Date",
		"X-Api-Version",
		"X-Captcha-Response",
	].join(", ");

	return async (...args: TArgs): Promise<TResult> => {
		const req = args[0] as Request;
		const origin = req?.headers?.get?.("origin") ?? null;

		// --- Handle CORS Preflight ---
		if (req?.method === "OPTIONS") {
			const headers: Record<string, string> = {
				"Access-Control-Allow-Methods": ALLOWED_METHODS,
				"Access-Control-Allow-Headers": ALLOWED_HEADERS,
				"Access-Control-Max-Age": "86400", // cache preflight for 1 day
				Vary: "Origin",
			};

			if (isAllowedOrigin(origin)) {
				headers["Access-Control-Allow-Origin"] = origin!;
				headers["Access-Control-Allow-Credentials"] = "true";
			}

			return new Response(null, { status: 204, headers }) as TResult;
		}

		try {
			const result = await handler(...args);

			// --- Attach CORS headers to main response ---
			if (result instanceof Response && isAllowedOrigin(origin)) {
				result.headers.set("Access-Control-Allow-Origin", origin!);
				result.headers.set("Access-Control-Allow-Credentials", "true");
				result.headers.set("Vary", "Origin");
			}

			return result;
		} catch (error) {
			console.error(`API error in ${routeName || "route"}:`, error);

			const status = error instanceof ApiError ? error.code || error.statusCode || defaultStatus : defaultStatus;

			const headers = isAllowedOrigin(origin)
				? {
					"Access-Control-Allow-Origin": origin!,
					"Access-Control-Allow-Credentials": "true",
					Vary: "Origin",
				}
				: undefined;

			return Response.json(
				{
					success: false,
					message: error instanceof Error ? error.message : "Unknown error occurred",
				},
				{ status, headers }
			) as TResult;
		}
	};
}