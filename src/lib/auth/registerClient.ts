import { authClient } from './authClient';
import { getErrorMessage } from '$lib/utils/error';
import toast from 'svelte-5-french-toast';
import { asyncHandlerClient } from '$lib/utils/handler';

export const handlePassKeyRegister = asyncHandlerClient(async () => {
	const notifToast = toast.loading('Adding Passkey...');
	const result = await authClient.passkey.addPasskey({
		fetchOptions: {
			onSuccess: () => {
				toast.success('Passkey added', {
					id: notifToast
				});
			}
		}
	});

	if (!result) {
		return null;
	}

	const { data, error } = result;

	if (error) {
		toast.error(getErrorMessage(error, 'Failed to add Passkey'));
		throw error;
	}

	return data;
}, 'handlePassKeyRegister');
