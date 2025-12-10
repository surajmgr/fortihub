<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { ArrowLeft } from '@lucide/svelte';
	import PasswordInput from '$lib/components/auth/PasswordInput.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import { signInWithPassword, signUpWithPassword } from '$lib/auth/authHandlers';
	import AlertMessage from '$lib/components/ui/AlertMessage.svelte';
	import { getErrorMessage } from '$lib/utils/error';
	import { goto } from '$app/navigation';

	interface Props {
		email: string;
		authMode: 'signin' | 'signup';
		callbackUrl: string;
		onBack: () => void;
		onSwitchToOTP?: () => void;
	}

	let { email, authMode, callbackUrl, onBack, onSwitchToOTP }: Props = $props();

	let password = $state('');
	let confirmPassword = $state('');
	let isLoading = $state(false);
	let error = $state('');
	let marketingOptIn = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (authMode === 'signup') {
			if (password.length < 8) {
				error = 'Password must be at least 8 characters long.';
				return;
			}
			if (password !== confirmPassword) {
				error = 'Passwords do not match.';
				return;
			}
		}

		isLoading = true;
		error = '';

		try {
			if (authMode === 'signup') {
				await signUpWithPassword({
					email,
					password,
					callbackUrl,
					marketingOptIn
				});
			} else {
				await signInWithPassword({
					email,
					password,
					callbackUrl
				});
			}
		} catch (err) {
			console.error('Error:', err);
			error = getErrorMessage(
				err,
				`Failed to ${authMode === 'signup' ? 'sign up' : 'sign in'}. Please try again.`
			);
		} finally {
			isLoading = false;
		}
	}
</script>

<Button variant="ghost" onclick={onBack} class="mb-4 -ml-2" disabled={isLoading}>
	<ArrowLeft class="h-4 w-4 mr-2" />
	Back
</Button>

{#if error}
	<AlertMessage type="error" message={error} />
{/if}

<form onsubmit={handleSubmit} class="space-y-4">
	<PasswordInput
		id="password"
		label="Password"
		bind:value={password}
		onChangeAction={(val) => (password = val)}
		placeholder="Enter your password"
		disabled={isLoading}
	/>

	{#if authMode === 'signup'}
		<PasswordInput
			id="confirm-password"
			label="Confirm Password"
			bind:value={confirmPassword}
			onChangeAction={(val) => (confirmPassword = val)}
			placeholder="Confirm your password"
			disabled={isLoading}
		/>

		<div class="py-1">
			<Checkbox
				id="marketing-opt-in"
				label="I agree to receive marketing emails and updates."
				bind:checked={marketingOptIn}
				disabled={isLoading}
			/>
		</div>
	{/if}

	<Button type="submit" class="w-full h-12 text-base font-medium" disabled={isLoading}>
		{isLoading ? 'Please wait...' : authMode === 'signup' ? 'Create account' : 'Sign in'}
	</Button>

	{#if onSwitchToOTP}
		<Button
			type="button"
			variant="link"
			class="w-full text-black"
			onclick={onSwitchToOTP}
			disabled={isLoading}
		>
			Use verification code instead
		</Button>
	{/if}

	{#if authMode === 'signin'}
		<div class="flex justify-between items-center text-sm mt-2">
			<Button
				type="button"
				variant="link"
				class="text-black w-full"
				onclick={() => goto(`/forgot-password?callbackUrl=${encodeURIComponent(callbackUrl)}`)}
				disabled={isLoading}
			>
				Forgot password?
			</Button>
		</div>
	{/if}
</form>
