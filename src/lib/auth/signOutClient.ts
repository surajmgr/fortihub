import { asyncHandlerClient } from '$lib/utils/handler';
import { authClient } from './authClient';

export const handleSignOut = asyncHandlerClient(async () => {
	await authClient.signOut();
}, 'signOutServerAction');
