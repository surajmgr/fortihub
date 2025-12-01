import type { HttpCode } from "./server/apiError";

export function getErrorMessage(error: unknown, defaultMessage = 'Something went wrong'): string {
	if (error instanceof Error && typeof error.message === 'string') {
		return error.message;
	}

	if (
		error &&
		typeof error === 'object' &&
		'message' in error &&
		typeof error.message === 'string'
	) {
		return error.message;
	}

	if (typeof error === 'string') {
		return error;
	}

	return defaultMessage;
}

export function getErrorCode(error: unknown): HttpCode {
	if (error instanceof Error && 'code' in error && typeof error.code === 'number') {
		return error.code as HttpCode;
	}

	if (
		error &&
		typeof error === 'object' &&
		'statusCode' in error &&
		typeof error.statusCode === 'number'
	) {
		return error.statusCode as HttpCode;
	}

	return 500;
}
