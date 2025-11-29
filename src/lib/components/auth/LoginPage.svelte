<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import EmailStep from '$lib/components/auth/steps/EmailStep.svelte';
	import PasswordStep from '$lib/components/auth/steps/PasswordStep.svelte';
	import OTPStep from '$lib/components/auth/steps/OTPStep.svelte';
	import SetPasswordStep from '$lib/components/auth/steps/SetPasswordStep.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { checkHasPassword, getSession } from '$lib/auth/authHandlers';
	import { authClient } from '$lib/auth/authClient';
	import type { GetSessionResponse } from '$lib/auth/authHandlers';
	import { getAuthCallbackURL, getHostURL, handleGoBack, isValidURL } from '$lib/utils/utils';

	type AuthStep =
		| 'email'
		| 'password'
		| 'otp'
		| 'set-password'
		| 'loading'
		| 'already-logged-in'
		| 'invalid-callback-url'
		| 'initializing';
	type AuthMode = 'signin' | 'signup';

	// Get query params from URL
	let queryParams = $derived($page.url.searchParams);
	let initialMode: AuthMode = $derived(
		queryParams.get('authMode') === 'signup' ? 'signup' : 'signin'
	);
	let callbackUrl = $derived(decodeURIComponent(queryParams.get('callbackUrl') || '/'));

	let email = $state('');
	let authMode = $state<AuthMode>('signin');
	let authStep = $state<AuthStep>('initializing');
	let hasPassword = $state(false);
	let useOTP = $state(false);
	let session = $state<GetSessionResponse | null>(null);

	$effect(() => {
		const init = async () => {
			if (!isValidURL(callbackUrl)) {
				authStep = 'invalid-callback-url';
				return;
			}
			authStep = 'loading';
			try {
				const data = await getSession({});
				if (data) {
					session = data;
					authStep = 'already-logged-in';
				} else {
					authStep = 'email';
				}
			} catch (e) {
				console.error(e);
				authStep = 'email';
			}
		};
		init();
	});

	// Set initial auth mode from URL
	$effect(() => {
		authMode = initialMode;
	});

	async function handleEmailContinue(emailValue: string) {
		email = emailValue;

		if (authMode === 'signup') {
			authStep = 'password';
			return;
		}

		// Check if user has password
		const userHasPassword = (
			await checkHasPassword({
				input: {
					email: emailValue.toLowerCase().trim()
				}
			})
		).data;
		hasPassword = userHasPassword;

		if (userHasPassword && !useOTP) {
			authStep = 'password';
		} else {
			authStep = 'otp';
		}
	}

	function handleOTPSuccess(promptSetPassword: boolean) {
		if (promptSetPassword && !hasPassword) {
			authStep = 'set-password';
		} else {
			window.location.href = getAuthCallbackURL(callbackUrl);
		}
	}

	function handleSetPasswordSuccess() {
		window.location.href = getAuthCallbackURL(callbackUrl);
	}

	function handleBackToEmail() {
		authStep = 'email';
		useOTP = false;
	}

	function handleSwitchToOTP() {
		useOTP = true;
		authStep = 'otp';
	}

	function getStepTitle() {
		switch (authStep) {
			case 'email':
				return authMode === 'signin' ? 'Welcome back' : 'Create account';
			case 'password':
				return authMode === 'signin' ? 'Enter your password' : 'Set your password';
			case 'otp':
				return 'Enter verification code';
			case 'set-password':
				return 'Set your password';
			case 'loading':
				return 'Checking session...';
			case 'already-logged-in':
				return 'Already logged in';
			case 'invalid-callback-url':
				return 'URL is invalid';
			case 'initializing':
				return 'Preparing to login...';
		}
	}

	function getStepDescription() {
		switch (authStep) {
			case 'email':
				return authMode === 'signin'
					? 'Sign in to your account to continue'
					: 'Sign up to get started';
			case 'password':
				return authMode === 'signin'
					? `Enter password for ${email}`
					: 'Choose a secure password for your account';
			case 'otp':
				return `We sent a code to ${email}`;
			case 'set-password':
				return 'Create a password for easier sign-in next time';
			case 'loading':
				return 'Please wait...';
			case 'already-logged-in':
				return `You are currently logged in as ${session?.user?.email}`;
			case 'invalid-callback-url':
				return 'Please go back and try again';
			case 'initializing':
				return 'Please wait...';
		}
	}

	async function handleSignOut() {
		await authClient.signOut();
		authStep = 'email';
		session = null;
	}

	function handleContinue() {
		window.location.href = getAuthCallbackURL(callbackUrl);
	}
</script>

<div
	class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4"
>
	<div class="w-full max-w-md">
		<!-- Header -->
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">
				{getStepTitle()}
			</h1>
			<p class="text-gray-600">{getStepDescription()}</p>
		</div>

		<!-- Main Card -->
		{#if authStep !== 'initializing'}
			<div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
				{#if authStep === 'email'}
					<EmailStep
						{authMode}
						{callbackUrl}
						onEmailContinue={handleEmailContinue}
						onSwitchMode={() => (authMode = authMode === 'signin' ? 'signup' : 'signin')}
					/>
				{/if}

				{#if authStep === 'password'}
					<PasswordStep
						{email}
						{authMode}
						{callbackUrl}
						onBack={handleBackToEmail}
						onSwitchToOTP={hasPassword && authMode === 'signin' ? handleSwitchToOTP : undefined}
					/>
				{/if}

				{#if authStep === 'otp'}
					<OTPStep {email} {callbackUrl} onBack={handleBackToEmail} onSuccess={handleOTPSuccess} />
				{/if}

				{#if authStep === 'set-password'}
					<SetPasswordStep
						onSuccess={handleSetPasswordSuccess}
						onSkip={() => (window.location.href = getAuthCallbackURL(callbackUrl))}
					/>
				{/if}

				{#if authStep === 'loading'}
					<div class="flex justify-center py-8">
						<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
					</div>
				{/if}

				{#if authStep === 'already-logged-in'}
					<div class="space-y-4">
						<Button class="w-full" onclick={handleContinue}>
							Continue to {getHostURL(callbackUrl)}
						</Button>
						<Button variant="outline" class="w-full" onclick={handleSignOut}>Sign out</Button>
					</div>
				{/if}
				{#if authStep === 'invalid-callback-url'}
					<div class="space-y-4">
						<Button class="w-full" onclick={handleGoBack}>Go back</Button>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Footer -->
		{#if authStep === 'email'}
			<div class="text-center mt-6 text-sm text-gray-600">
				{#if authMode === 'signin'}
					Don't have an account?
					<Button
						type="button"
						variant="link"
						onclick={() => (authMode = 'signup')}
						class="font-medium"
					>
						Sign up
					</Button>
				{:else}
					Already have an account?
					<Button
						type="button"
						variant="link"
						onclick={() => (authMode = 'signin')}
						class="font-medium"
					>
						Sign in
					</Button>
				{/if}
			</div>
		{/if}
	</div>
</div>
