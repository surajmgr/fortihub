<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { getSession } from '$lib/auth/authHandlers';
	import Button from '$lib/components/ui/Button.svelte';
	import { goto } from '$app/navigation';
	import { isSameDomain } from '$lib/utils/utils';

	let status = $state<'loading' | 'error' | 'redirecting'>('loading');
	let errorMessage = $state('');
	let redirectTo = $derived($page.url.searchParams.get('redirectTo'));

	onMount(async () => {
		if (!redirectTo) {
			status = 'error';
			errorMessage = 'No redirect URL provided.';
			return;
		}

		try {
			// 1. Check if we have a session
			const session = await getSession({});

			if (!session || !session.session) {
				status = 'error';
				errorMessage = 'Authentication failed. No session found.';
				return;
			}

			// 2. Construct target URL
			const targetUrl = new URL(redirectTo);
			const currentUrl = new URL(window.location.href);

			// 3. If cross-domain, append token
			if (!isSameDomain(targetUrl, currentUrl)) {
				targetUrl.searchParams.set('token', session.session.token);
			}

			status = 'redirecting';

			// 4. Redirect
			window.location.href = targetUrl.toString();
		} catch (e) {
			console.error(e);
			status = 'error';
			errorMessage = 'An error occurred during redirection.';
		}
	});

	function handleGoBack() {
		goto(`/login?callbackUrl=${redirectTo}`);
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
	<div
		class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center"
	>
		{#if status === 'loading' || status === 'redirecting'}
			<div class="flex flex-col items-center justify-center space-y-4">
				<div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
				<p class="text-gray-600 font-medium">
					{status === 'loading' ? 'Verifying session...' : 'Redirecting you...'}
				</p>
			</div>
		{:else if status === 'error'}
			<div class="flex flex-col items-center justify-center space-y-4">
				<div
					class="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
				</div>
				<h2 class="text-xl font-bold text-gray-900">Something went wrong</h2>
				<p class="text-gray-600">{errorMessage}</p>
				<div class="pt-4 w-full">
					<Button class="w-full" onclick={handleGoBack}>Go Back</Button>
				</div>
			</div>
		{/if}
	</div>
</div>
