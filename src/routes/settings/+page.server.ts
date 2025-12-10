import { auth } from '$lib/auth/server';
import { redirect } from '@sveltejs/kit';
import db from '$lib/db';
import ApiError from '$lib/utils/server/apiError';
import { getUserConsents, CONSENT_CONFIG } from '$lib/utils/server/defaults';

export async function load({ request }: { request: Request }) {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session?.user) throw redirect(302, '/login?callbackUrl=' + encodeURIComponent(request.url));

	const database = db();
	if (!database) throw new ApiError('DB instance not found', 500);

	// Fetch consents
	const consents = await getUserConsents('all');

	return {
		user: session.user,
		consents,
		consentConfig: CONSENT_CONFIG
	};
}
