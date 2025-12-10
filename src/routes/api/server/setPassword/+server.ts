import { json } from '@sveltejs/kit';
import { auth } from '$lib/auth/server';
import { apiAsyncHandler } from '$lib/utils/server/handler';
import { validateRequestBody } from '$lib/utils/server/validateRequestBody';
import { setPasswordSchema, type SetPasswordSchema } from '$lib/schema/server/auth';
import ApiError from '$lib/utils/server/apiError';
import { getErrorCode, getErrorMessage } from '$lib/utils/error';

export const POST = apiAsyncHandler(async ({ request }) => {
	const body = (await request.json()) as SetPasswordSchema;
	const [validatedError, validatedFields] = validateRequestBody(setPasswordSchema, body);
	if (validatedError) return json(validatedError, { status: 400 });

	const { newPassword } = validatedFields;

	let response;
	try {
		response = await auth.api.setPassword({
			body: { newPassword },
			headers: request.headers
		});
	} catch (error) {
		throw new ApiError(getErrorMessage(error, 'Something went wrong'), getErrorCode(error));
	}

	return json({
		success: true,
		message: 'Password set successfully',
		data: response
	});
}, 'api: setPassword');
