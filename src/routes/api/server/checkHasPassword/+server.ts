import { validateRequestBody } from '$lib/utils/server/validateRequestBody';
import { checkHasPassword } from '$lib/data-access/auth';
import { apiAsyncHandler } from '$lib/utils/server/handler';
import { checkHasPasswordSchema, type CheckHasPasswordSchema } from '$lib/schema/server/auth';
import { json } from '@sveltejs/kit';

export const GET = apiAsyncHandler(async ({ url }) => {
	const emailSP = url.searchParams.get('email');
	const [validatedError, validatedFields] = validateRequestBody(checkHasPasswordSchema, {
		email: emailSP
	});
	if (validatedError) return json(validatedError, { status: 400 });

	const { email } = validatedFields as CheckHasPasswordSchema;
	const hasPassword = await checkHasPassword(email);

	return json({
		success: true,
		message: 'Password checked successfully',
		data: hasPassword
	});
}, 'api: checkHasPassword');

export const POST = apiAsyncHandler(async ({ request }) => {
	const body = (await request.json()) as CheckHasPasswordSchema;
	const [validatedError, validatedFields] = validateRequestBody(checkHasPasswordSchema, body);
	if (validatedError) return json(validatedError, { status: 400 });

	const { email } = validatedFields;
	const hasPassword = await checkHasPassword(email);

	return json({
		success: true,
		message: 'Password checked successfully',
		data: hasPassword
	});
}, 'api: checkHasPassword');
