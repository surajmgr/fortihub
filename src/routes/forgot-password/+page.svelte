<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/Button.svelte';
	import { ArrowLeft } from '@lucide/svelte';
	import { requestPasswordReset } from '$lib/auth/authHandlers';
	import AlertMessage from '$lib/components/ui/AlertMessage.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { getErrorMessage } from '$lib/utils/error';
	import { goto } from '$app/navigation';

	let email = $state('');
	let isLoading = $state(false);
	let error = $state('');
	let success = $state(false);

	let callbackUrl = $derived(decodeURIComponent($page.url.searchParams.get('callbackUrl') || '/'));

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isLoading = true;
		error = '';
		success = false;

		try {
			const redirectTo = `${window.location.origin}/reset-password?callbackUrl=${encodeURIComponent(callbackUrl)}`;
			await requestPasswordReset({
				email,
				redirectTo
			});
			success = true;
		} catch (err) {
			console.error('Error:', err);
			error = getErrorMessage(err, 'Failed to send reset link. Please try again.');
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Forgot Password - FortiHub</title>
	<meta name="description" content="Reset your FortiHub account password." />
</svelte:head>

<div
	class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4"
>
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
			<p class="text-gray-600">Enter your email to receive a password reset link</p>
		</div>

		<div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
			<Button
				variant="ghost"
				onclick={() => goto(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)}
				class="mb-4 -ml-2"
			>
				<ArrowLeft class="h-4 w-4 mr-2" />
				Back to Login
			</Button>

			{#if success}
				<AlertMessage
					type="success"
					message="If an account exists for {email}, we have sent a password reset link to it."
				/>
				<div class="mt-4">
					<Button
						variant="outline"
						class="w-full"
						onclick={() => goto(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)}
					>
						Return to Login
					</Button>
				</div>
			{:else}
				{#if error}
					<AlertMessage type="error" message={error} />
				{/if}

				<form onsubmit={handleSubmit} class="space-y-4 mt-4">
					<Input
						id="email"
						type="email"
						bind:value={email}
						placeholder="name@example.com"
						disabled={isLoading}
						required
					/>

					<Button type="submit" class="w-full h-12 text-base font-medium" disabled={isLoading}>
						{isLoading ? 'Sending link...' : 'Send Reset Link'}
					</Button>
				</form>
			{/if}
		</div>
	</div>
</div>
