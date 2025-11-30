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
	import { onMount, untrack } from 'svelte';

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
	let rawCallbackUrl = $state(
		untrack(() => decodeURIComponent(queryParams.get('callbackUrl') || ''))
	);
	let isEditable = $state(untrack(() => queryParams.get('editable') === 'true'));
	let isEditingUrl = $state(false);
	let urlError = $state('');
	let urlInputRef: HTMLInputElement | undefined = $state();

	// Derived state for the actual callback URL to use
	let callbackUrl = $derived(rawCallbackUrl || '/');

	let email = $state('');
	let authMode = $state<AuthMode>('signin');
	let authStep = $state<AuthStep>('initializing');
	let hasPassword = $state(false);
	let useOTP = $state(false);
	let session = $state<GetSessionResponse | null>(null);

	// Initialize session check only once
	onMount(() => {
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

	$effect(() => {
		if (isEditingUrl && urlInputRef) {
			urlInputRef.focus();
		}
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
	class="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-purple-50 flex items-center justify-center p-4"
>
	<div class="w-full max-w-md">
		<!-- Header -->
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">
				{getStepTitle()}
			</h1>

			<div class="flex flex-col items-center justify-center text-gray-600 text-sm">
				<div class="text-center">
					<span class="font-medium">{getStepDescription()}</span>
				</div>

				{#if (callbackUrl && callbackUrl !== '/' && authStep !== 'already-logged-in') || isEditingUrl}
					<div class="flex flex-wrap items-center justify-center gap-2 text-center">
						<span class="text-gray-500">to</span>

						<div class="relative inline-block">
							{#if isEditingUrl}
								<input
									bind:this={urlInputRef}
									type="text"
									bind:value={rawCallbackUrl}
									placeholder="https://your-app.com"
									onkeydown={(e) => e.key === 'Enter' && validateAndSaveUrl()}
									onblur={validateAndSaveUrl}
									class="w-full px-3 py-2 rounded-lg bg-white/70 shadow-sm border outline-none font-medium text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 text-center min-w-[260px] max-w-[380px] backdrop-blur-sm {urlError
										? 'border-red-500 focus:ring-red-400'
										: 'border-gray-300'}"
								/>

								{#if urlError}
									<p
										class="absolute left-1/2 -translate-x-1/2 mt-1 text-xs text-red-500 whitespace-nowrap animate-in fade-in"
									>
										{urlError}
									</p>
								{/if}
							{:else}
								<button
									type="button"
									class="group inline-flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-700 px-2 py-1 -mx-2 rounded transition-all duration-150"
									onclick={() => isEditable && (isEditingUrl = true)}
									disabled={!isEditable}
									title={isEditable ? 'Click to edit URL' : undefined}
								>
									<span class="border-b border-dashed border-blue-400">
										{getHostURL(callbackUrl)}
									</span>

									{#if isEditable}
										<svg
											class="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
											<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
										</svg>
									{/if}
								</button>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Main Card -->
		{#if authStep !== 'initializing'}
			<div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
				{#if authStep === 'email'}
					<EmailStep {callbackUrl} onEmailContinue={handleEmailContinue} />
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
						<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
