<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { Mail } from '@lucide/svelte';
	import OAuthProviders from '$lib/components/auth/OAuthProviders.svelte';
	import { handleAnonymousSignIn, handleSocialSignIn } from '$lib/auth/authHandlers';
	import AlertMessage from '$lib/components/ui/AlertMessage.svelte';
	import { getErrorMessage } from '$lib/utils/error';
	import { ALLOWED_SOCIAL_PROVIDERS, type SocialProvider } from '$lib/utils/publicConstants';

	interface Props {
		callbackUrl: string;
		onEmailContinue: (email: string) => Promise<void>;
	}

	let { callbackUrl, onEmailContinue }: Props = $props();

	let email = $state('');
	let isLoading = $state(false);
	let error = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!email.trim()) {
			error = 'Please enter your email address.';
			return;
		}

		isLoading = true;
		error = '';

		try {
			await onEmailContinue(email.trim());
		} catch (err) {
			console.error('Error:', err);
			error = getErrorMessage(err, 'Failed to continue. Please try again.');
		} finally {
			isLoading = false;
		}
	}

	async function handleOAuthSignIn(provider: SocialProvider | 'passkey' | 'anonymous') {
		isLoading = true;
		error = '';

		try {
			switch (provider) {
				case 'anonymous':
					await handleAnonymousSignIn({ callbackUrl });
					break;
				default:
					if (!ALLOWED_SOCIAL_PROVIDERS.includes(provider)) {
						throw new Error(`Invalid provider: ${provider}`);
					}
					await handleSocialSignIn({ provider, callbackUrl });
					break;
			}
		} catch (err) {
			console.error(`Error signing in with ${provider}:`, err);
			error = getErrorMessage(err, `Failed to sign in with ${provider}. Please try again.`);
		} finally {
			isLoading = false;
		}
	}
</script>

{#if error}
	<AlertMessage type="error" message={error} />
{/if}

<OAuthProviders
	onSocialClickAction={(provider: SocialProvider) => handleOAuthSignIn(provider)}
	{isLoading}
/>

<form onsubmit={handleSubmit} class="space-y-4">
	<div>
		<label for="email" class="sr-only"> Email address </label>
		<div class="relative">
			<Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
			<Input
				id="email"
				type="email"
				placeholder="Enter your email"
				bind:value={email}
				class="pl-10 h-10 w-full"
				disabled={isLoading}
			/>
		</div>
	</div>

	<Button type="submit" class="w-full" disabled={isLoading}>
		{isLoading ? 'Please wait...' : 'Continue'}
	</Button>
</form>
