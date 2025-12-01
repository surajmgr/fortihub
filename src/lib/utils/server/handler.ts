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
		try {
			const result = await handler(...args);
			return result;
		} catch (error) {
			console.error(`API error in ${routeName || "route"}:`, error);

			const status = error instanceof ApiError ? error.code || error.statusCode || defaultStatus : defaultStatus;

			return Response.json(
				{
					success: false,
					message: error instanceof Error ? error.message : "Unknown error occurred",
				},
				{ status }
			) as TResult;
		}
	};
}