import { asyncHandlerClient } from '$lib/utils/handler';
import { authClient } from './authClient';

export const handlePassKeySignIn = asyncHandlerClient(async (args?: { callbackUrl?: string }) => {
	const { callbackUrl = '/' } = args || {};
	const { data, error } = await authClient.signIn.passkey({
		fetchOptions: {
			onSuccess: () => {
				window.location.href = callbackUrl;
			}
		}
	});

	if (error) {
		throw error;
	}

	return data;
}, 'handlePassKeySignIn');

export const handleAnonymousSignIn = asyncHandlerClient(async (args?: { callbackUrl?: string }) => {
	const { callbackUrl = '/' } = args || {};
	void callbackUrl;
	const { data, error } = await authClient.signIn.anonymous({});

	if (error) {
		throw error;
	}

	return data;
}, 'handleAnonymousSignIn');

export const handleOneTapSignIn = asyncHandlerClient(async (args?: { callbackUrl?: string }) => {
	const { callbackUrl = '/' } = args || {};
	await authClient.oneTap({
		fetchOptions: {
			onSuccess: () => {
				window.location.href = callbackUrl;
			}
		}
	});

	return null;
}, 'handleOneTapSignIn');
