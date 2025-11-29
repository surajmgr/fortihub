import { createAuthClient } from 'better-auth/svelte';
import { getAuthURL } from '$lib/utils/utils';
import {
	anonymousClient,
	emailOTPClient,
	oneTapClient,
	usernameClient
} from 'better-auth/client/plugins';
import { passkeyClient } from '@better-auth/passkey/client';
import { GOOGLE_CLIENT_ID } from '$lib/utils/publicConstants';

export const authClient = createAuthClient({
	baseURL: getAuthURL(),
	init: {
		credentials: 'include'
	},
	plugins: [
		usernameClient(),
		passkeyClient(),
		anonymousClient(),
		oneTapClient({
			clientId: GOOGLE_CLIENT_ID || ""
		}),
		emailOTPClient()
	]
});
