<script lang="ts">
	import { onMount } from 'svelte';
	import { Turnstile } from 'svelte-turnstile';
	import Button from '$lib/components/ui/Button.svelte';
	import { ArrowLeft, Loader2 } from '@lucide/svelte';
	import OTPInput from '$lib/components/auth/OTPInput.svelte';
	import { sendVerificationOTP, signInWithEmailOTP } from '$lib/auth/authHandlers';
	import AlertMessage from '$lib/components/ui/AlertMessage.svelte';
	import { getErrorMessage } from '$lib/utils/error';
	import { PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY } from '$env/static/public';

	interface Props {
		email: string;
		callbackUrl: string;
		onBack: () => void;
		onSuccess: (promptSetPassword: boolean) => void;
	}

	let { email, callbackUrl, onBack, onSuccess }: Props = $props();

	let otp = $state(['', '', '', '', '', '']);
	let isLoading = $state(false);
	let otpSent = $state(false);
	let error = $state('');
	let successMessage = $state('');
	let resendTimer = $state(0);
	let turnstileToken = $state<string | null>(null);
	let turnstileResetKey = $state(0);

	$effect(() => {
		if (resendTimer > 0) {
			const timer = setTimeout(() => (resendTimer = resendTimer - 1), 1000);
			return () => clearTimeout(timer);
		}
	});

	function consumeTurnstileToken() {
		turnstileToken = null;
		turnstileResetKey++;
	}

	async function handleSendOTP() {
		if (!turnstileToken) {
			error = 'Please complete the CAPTCHA first.';
			return;
		}

		isLoading = true;
		error = '';
		successMessage = '';

		try {
			await sendVerificationOTP({
				email,
				type: 'sign-in',
				turnstileToken
			});

			otpSent = true;
			resendTimer = 60;
			successMessage = 'Verification code sent! Check your email.';
			setTimeout(() => document.getElementById('otp-0')?.focus(), 100);
		} catch (err) {
			error = getErrorMessage(err, 'Failed to send verification code.');
		} finally {
			isLoading = false;
			consumeTurnstileToken();
		}
	}

	function handleOtpChange(val: string[]) {
		otp = val;
		error = '';
	}

	async function handleOtpVerification() {
		const otpValue = otp.join('');
		if (otpValue.length !== 6) {
			error = 'Please enter the complete 6-digit code.';
			return;
		}
		if (!turnstileToken) {
			error = 'Please complete the CAPTCHA first.';
			return;
		}

		isLoading = true;
		error = '';

		try {
			await signInWithEmailOTP({
				email,
				otp: otpValue,
				callbackUrl,
				turnstileToken
			});
			onSuccess(true);
		} catch (err) {
			console.error('Error verifying OTP:', err);
			const errorMessage = getErrorMessage(err);
			if (errorMessage.includes('TOO_MANY_ATTEMPTS')) {
				error = 'Too many failed attempts. Please request a new code.';
			} else if (errorMessage.includes('expired')) {
				error = 'This code has expired. Please request a new one.';
			} else {
				error = 'Invalid verification code. Please try again.';
			}
			otp = ['', '', '', '', '', ''];
			document.getElementById('otp-0')?.focus();
		} finally {
			isLoading = false;
			consumeTurnstileToken();
		}
	}

	async function handleResendOTP() {
		if (resendTimer > 0) return;
		if (!turnstileToken) {
			error = 'Please complete the CAPTCHA first.';
			return;
		}

		isLoading = true;
		error = '';
		successMessage = '';

		try {
			await sendVerificationOTP({
				email,
				type: 'sign-in',
				turnstileToken
			});
			resendTimer = 60;
			otp = ['', '', '', '', '', ''];
			successMessage = 'New code sent!';
			document.getElementById('otp-0')?.focus();
		} catch (err) {
			error = getErrorMessage(err, 'Failed to resend code. Please try again.');
		} finally {
			isLoading = false;
			consumeTurnstileToken();
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
{#if successMessage}
	<AlertMessage type="success" message={successMessage} />
{/if}

<div class="my-4 flex justify-center">
	{#key turnstileResetKey}
		<Turnstile
			siteKey={PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY}
			on:turnstile-callback={(e) => {
				turnstileToken = e.detail.token;
			}}
			on:turnstile-expired={() => (turnstileToken = null)}
			theme="auto"
		/>
	{/key}
</div>

{#if !otpSent}
	<div class="flex flex-col items-center space-y-4 mt-2">
		<p class="text-center text-gray-600">
			We'll send a 6-digit code to <strong>{email}</strong> for verification.
		</p>
		<Button onclick={handleSendOTP} disabled={isLoading || !turnstileToken} class="w-full">
			{#if isLoading}
				<Loader2 class="animate-spin mr-2 h-4 w-4" />
			{/if}
			{isLoading ? 'Sending...' : 'Send verification code'}
		</Button>
	</div>
{:else}
	<div class="space-y-6 mt-6">
		<OTPInput {otp} onOtpChange={handleOtpChange} />

		<div class="flex justify-center">
			<Button
				onclick={handleOtpVerification}
				disabled={isLoading || otp.join('').length < 6 || !turnstileToken}
				class="w-full"
			>
				{#if isLoading}
					<Loader2 class="animate-spin mr-2 h-4 w-4" />
				{/if}
				{isLoading ? 'Verifying...' : 'Verify Code'}
			</Button>
		</div>

		<div class="text-center">
			<Button
				type="button"
				variant="link"
				onclick={handleResendOTP}
				disabled={resendTimer > 0 || isLoading}
				class="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
			>
				{resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
			</Button>
		</div>
	</div>
{/if}
