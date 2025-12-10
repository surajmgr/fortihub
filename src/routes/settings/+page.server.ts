import { auth } from '$lib/auth/server';
import { redirect } from '@sveltejs/kit';
import { userConsents } from '$lib/db/auth.schema';
import db from '$lib/db';
import { eq } from 'drizzle-orm';
import ApiError from '$lib/utils/server/apiError';

export async function load({ request }: { request: Request }) {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session?.user) throw redirect(302, '/login');

	const database = db();
	if (!database) throw new ApiError('DB instance not found', 500);

	// Fetch consents
	const consents = await database
		.select()
		.from(userConsents)
		.where(eq(userConsents.userId, session.user.id));

	return {
		user: session.user,
		consents: consents.map((c) => ({ key: c.key, value: c.value }))
	};
}
