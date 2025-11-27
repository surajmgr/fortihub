<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import PasswordInput from '$lib/components/auth/PasswordInput.svelte';
	import AlertMessage from '$lib/components/ui/AlertMessage.svelte';
	import { getErrorMessage } from '$lib/utils/error';
	import { setPassword } from '$lib/auth/authHandlers';

	interface Props {
		onSuccess: () => void;
		onSkip: () => void;
	}

	let { onSuccess, onSkip }: Props = $props();

	let password = $state('');
	let confirmPassword = $state('');
	let isLoading = $state(false);
	let error = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (password.length < 8) {
			error = 'Password must be at least 8 characters long.';
			return;
		}
		if (password !== confirmPassword) {
			error = 'Passwords do not match.';
			return;
		}

		isLoading = true;
		error = '';

		try {
			const result = await setPassword({
				input: {
					newPassword: password
				}
			});
			if (result.success) {
				onSuccess();
			} else {
				error = 'Failed to set password. Please try again.';
			}
		} catch (err) {
			console.error('Error setting password:', err);
			error = getErrorMessage(err, 'Failed to set password. Please try again.');
		} finally {
			isLoading = false;
		}
	}
</script>

{#if error}
	<AlertMessage type="error" message={error} />
{/if}

<div class="mb-6">
	<p class="text-sm text-gray-600">
		Setting a password will make it easier to sign in next time. You can skip this step and continue
		using email verification codes.
	</p>
</div>

<form onsubmit={handleSubmit} class="space-y-4">
	<PasswordInput
		id="new-password"
		label="Password"
		bind:value={password}
		onChangeAction={(val) => (password = val)}
		placeholder="Enter your password"
		disabled={isLoading}
	/>

	<PasswordInput
		id="confirm-new-password"
		label="Confirm Password"
		bind:value={confirmPassword}
		onChangeAction={(val) => (confirmPassword = val)}
		placeholder="Confirm your password"
		disabled={isLoading}
	/>

	<div class="space-y-2">
		<Button type="submit" class="w-full h-12 text-base font-medium" disabled={isLoading}>
			{isLoading ? 'Setting password...' : 'Set password'}
		</Button>

		<Button type="button" variant="ghost" class="w-full" onclick={onSkip} disabled={isLoading}>
			Skip for now
		</Button>
	</div>
</form>
