<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/Button.svelte';
	import { resetPassword } from '$lib/auth/authHandlers';
	import AlertMessage from '$lib/components/ui/AlertMessage.svelte';
	import PasswordInput from '$lib/components/auth/PasswordInput.svelte';
	import { getErrorMessage } from '$lib/utils/error';
	import { goto } from '$app/navigation';

	let newPassword = $state('');
	let confirmPassword = $state('');
	let isLoading = $state(false);
	let error = $state('');
	let success = $state(false);

	let token = $derived($page.url.searchParams.get('token'));
	let tokenError = $derived($page.url.searchParams.get('error'));
	let callbackUrl = $derived(decodeURIComponent($page.url.searchParams.get('callbackUrl') || '/'));

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (newPassword.length < 8) {
			error = 'Password must be at least 8 characters long.';
			return;
		}
		if (newPassword !== confirmPassword) {
			error = 'Passwords do not match.';
			return;
		}
		if (!token) {
			error = 'Invalid or missing reset token.';
			return;
		}

		isLoading = true;
		error = '';

		try {
			await resetPassword({
				newPassword,
				token
			});
			success = true;
		} catch (err) {
			console.error('Error:', err);
			error = getErrorMessage(err, 'Failed to reset password. Please try again.');
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Reset Password - FortiHub</title>
	<meta name="description" content="Reset your FortiHub account password." />
</svelte:head>

<div
	class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4"
>
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Set New Password</h1>
			<p class="text-gray-600">Create a new secure password for your account</p>
		</div>

		<div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
			{#if success}
				<AlertMessage type="success" message="Your password has been successfully reset." />
				<div class="mt-4">
					<Button
						class="w-full"
						onclick={() => goto(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)}
					>
						Continue to Login
					</Button>
				</div>
			{:else if tokenError || !token || error === 'Invalid token'}
				<AlertMessage
					type="error"
					message={tokenError === 'INVALID_TOKEN'
						? 'The reset link is invalid or has expired.'
						: 'Invalid reset link.'}
				/>
				<div class="mt-4">
					<Button
						variant="outline"
						class="w-full"
						onclick={() => goto(`/forgot-password?callbackUrl=${encodeURIComponent(callbackUrl)}`)}
					>
						Request New Link
					</Button>
				</div>
			{:else}
				{#if error}
					<AlertMessage type="error" message={error} />
				{/if}

				<form onsubmit={handleSubmit} class="space-y-4 mt-4">
					<PasswordInput
						id="new-password"
						label="New Password"
						bind:value={newPassword}
						onChangeAction={(val) => (newPassword = val)}
						placeholder="Enter new password"
						disabled={isLoading}
					/>

					<PasswordInput
						id="confirm-password"
						label="Confirm Password"
						bind:value={confirmPassword}
						onChangeAction={(val) => (confirmPassword = val)}
						placeholder="Confirm new password"
						disabled={isLoading}
					/>

					<Button type="submit" class="w-full h-12 text-base font-medium" disabled={isLoading}>
						{isLoading ? 'Resetting...' : 'Reset Password'}
					</Button>
				</form>
			{/if}
		</div>
	</div>
</div>
