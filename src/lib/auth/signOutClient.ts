import { asyncHandlerClient } from '../utils/handler';
import { authClient } from './authClient';

export const handleSignOut = asyncHandlerClient(async () => {
	await authClient.signOut();
}, 'signOutServerAction');
