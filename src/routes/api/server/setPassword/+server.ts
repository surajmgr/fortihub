import { json } from "@sveltejs/kit";
import { auth } from "$lib/auth/server";
import { apiAsyncHandler } from "$lib/utils/server/handler";
import { validateRequestBody } from "$lib/utils/server/validateRequestBody";
import { setPasswordSchema, type SetPasswordSchema } from "$lib/schema/server/auth";

export const OPTIONS = apiAsyncHandler(async () => { return json({ success: true }); });

export const POST = apiAsyncHandler(async ({ request }) => {
	const body = (await request.json()) as SetPasswordSchema;
	const [validatedError, validatedFields] = validateRequestBody(setPasswordSchema, body);
	if (validatedError) return json(validatedError, { status: 400 });

	const { newPassword } = validatedFields;

	const response = await auth.api.setPassword({
		body: { newPassword },
		headers: request.headers,
	});

	return json({
		success: true,
		message: "Password set successfully",
		data: response,
	});
}, "api: setPassword");