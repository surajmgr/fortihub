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
	import { Pencil, Check } from '@lucide/svelte';

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

	// Callback URL handling
	let rawCallbackUrl = $state(decodeURIComponent(queryParams.get('callbackUrl') || ''));
	let isEditable = $state(queryParams.get('editable') === 'true');
	let isEditingUrl = $state(false);
	let urlError = $state('');

	// Derived state for the actual callback URL to use
	let callbackUrl = $derived(rawCallbackUrl || '/');

	let email = $state('');
	let authMode = $state<AuthMode>('signin');
	let authStep = $state<AuthStep>('initializing');
	let hasPassword = $state(false);
	let useOTP = $state(false);
	let session = $state<GetSessionResponse | null>(null);

	$effect(() => {
		const init = async () => {
			// If no callback URL provided or invalid, allow editing
			if (!rawCallbackUrl || !isValidURL(rawCallbackUrl)) {
				if (rawCallbackUrl && !isValidURL(rawCallbackUrl)) {
					urlError = 'Invalid URL format';
				}
				isEditingUrl = true;
				// Don't block init, just let user fix it
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

	$effect(() => {
		authMode = initialMode;
	});

	function validateAndSaveUrl() {
		if (!rawCallbackUrl) {
			urlError = 'URL is required';
			return;
		}
		if (!isValidURL(rawCallbackUrl)) {
			urlError = 'Invalid URL format';
			return;
		}
		urlError = '';
		isEditingUrl = false;

		// Update URL params without reloading
		const newUrl = new URL(window.location.href);
		newUrl.searchParams.set('callbackUrl', encodeURIComponent(rawCallbackUrl));
		window.history.pushState({}, '', newUrl);
	}

	async function handleEmailContinue(emailValue: string) {
		if (isEditingUrl) {
			validateAndSaveUrl();
			if (isEditingUrl) return; // Failed validation
		}

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

			{#if isEditingUrl || (!isValidURL(callbackUrl) && callbackUrl !== '/')}
				<div class="mt-4 max-w-sm mx-auto relative group">
					<input
						type="text"
						bind:value={rawCallbackUrl}
						placeholder="https://your-app.com"
						class="w-full text-center bg-transparent border-b border-dashed border-gray-300 focus:border-indigo-500 outline-none py-1 px-8 text-gray-600 placeholder:text-gray-400 transition-colors"
						onkeydown={(e) => e.key === 'Enter' && validateAndSaveUrl()}
						onblur={validateAndSaveUrl}
						autofocus
					/>
					{#if urlError}
						<p class="text-red-500 text-xs mt-1">{urlError}</p>
					{/if}
				</div>
			{:else}
				<div class="flex flex-col items-center justify-center gap-1 text-gray-600">
					<p>{getStepDescription()}</p>

					{#if callbackUrl && callbackUrl !== '/' && authStep !== 'already-logged-in'}
						<div class="flex items-center gap-2 text-sm mt-1 group relative">
							<span class="text-gray-500">to</span>
							<button
								class="font-medium text-indigo-600 hover:text-indigo-700 border-b border-transparent hover:border-indigo-200 transition-all flex items-center gap-1.5"
								onclick={() => isEditable && (isEditingUrl = true)}
								disabled={!isEditable}
								title={isEditable ? 'Click to edit URL' : undefined}
							>
								{getHostURL(callbackUrl)}
								{#if isEditable}
									<Pencil size={12} class="opacity-0 group-hover:opacity-50 transition-opacity" />
								{/if}
							</button>
						</div>
					{/if}
				</div>
			{/if}
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
