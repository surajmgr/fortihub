import { createAuthClient } from 'better-auth/svelte';
import { getAuthURL } from '$lib/utils/utils';
import {
	anonymousClient,
	emailOTPClient,
	oneTapClient,
	usernameClient
} from 'better-auth/client/plugins';
import { passkeyClient } from '@better-auth/passkey/client';
import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';

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
			clientId: PUBLIC_GOOGLE_CLIENT_ID
		}),
		emailOTPClient()
	]
});
