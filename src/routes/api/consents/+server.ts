import { json } from '@sveltejs/kit';
import { auth } from '$lib/auth/server';
import { apiAsyncHandler } from '$lib/utils/server/handler';
import ApiError from '$lib/utils/server/apiError';
import { validateRequestBody } from '$lib/utils/server/validateRequestBody';
import { updateConsentSchema, type UpdateConsentSchema } from '$lib/schema/server/consents';
import { updateUserConsent } from '$lib/data-access/consents';

export const POST = apiAsyncHandler(async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session?.user) throw new ApiError('Unauthorized', 401);

	const body = (await request.json()) as UpdateConsentSchema;
	const [validatedError, validatedFields] = validateRequestBody(updateConsentSchema, body);

	if (validatedError) return json(validatedError, { status: 400 });

	const { key, value } = validatedFields;
	await updateUserConsent({
		userId: session.user.id,
		key,
		value
	});

	return json({ success: true, message: 'Consent updated' });
}, 'api: consents');
