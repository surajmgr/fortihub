<script lang="ts">
	import OAuthProviders from '$lib/components/auth/OAuthProviders.svelte';
	import { Check, Link, Settings, ExternalLink, Edit2, X } from '@lucide/svelte';
	import { ALLOWED_SOCIAL_PROVIDERS, type SocialProvider } from '$lib/utils/publicConstants';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	// Initialize state from URL
	let urlParams = $derived($page.url.searchParams);

	let selectedTemplate = $state(urlParams.get('template') ?? 'popular');
	let selectedIncludes = $state<string[]>(
		urlParams.get('include')?.split(',').filter(Boolean) ?? []
	);
	let demoCallbackUrl = $state(urlParams.get('callbackUrl') ?? '');
	let demoEditable = $state(urlParams.get('editable') === 'true');

	// Callback URL editing state
	let isEditingUrl = $state(false);
	let urlInputRef: HTMLInputElement | undefined = $state();
	let urlError = $state('');

	function validateUrl(url: string) {
		if (!url) return true; // Empty is allowed (defaults to something)
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	}

	function handleUrlSubmit() {
		if (validateUrl(demoCallbackUrl)) {
			isEditingUrl = false;
			urlError = '';
		} else {
			urlError = 'Invalid URL format';
		}
	}

	function toggleInclude(provider: string) {
		if (selectedIncludes.includes(provider)) {
			selectedIncludes = selectedIncludes.filter((p) => p !== provider);
		} else {
			selectedIncludes = [...selectedIncludes, provider];
		}
	}

	function getLoginUrl() {
		const params = new URLSearchParams();
		if (selectedTemplate !== 'popular') params.set('template', selectedTemplate);
		if (selectedIncludes.length > 0) params.set('include', selectedIncludes.join(','));
		if (demoCallbackUrl) params.set('callbackUrl', demoCallbackUrl);
		if (demoEditable) params.set('editable', 'true');
		return `/login?${params.toString()}`;
	}

	const displayProviders = ALLOWED_SOCIAL_PROVIDERS;
</script>

<div class="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
	<!-- Header -->
	<header class="w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
		<div class="flex items-center gap-3">
			<div
				class="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200"
			>
				<Settings size={20} />
			</div>
			<h1 class="text-2xl font-bold tracking-tight text-gray-900">
				Auth<span class="text-blue-600">Microservice</span>
			</h1>
		</div>
		<a
			href="https://github.com/surajmgr/AuthMS"
			target="_blank"
			class="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
		>
			Documentation
		</a>
	</header>

	<main
		class="flex-1 w-full max-w-7xl mx-auto px-6 py-12 lg:py-20 grid lg:grid-cols-2 gap-16 lg:gap-24 items-start"
	>
		<!-- Left: Configuration -->
		<div class="space-y-12">
			<div>
				<h2 class="text-4xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
					Configure your <br />
					<span class="text-blue-600">Perfect Login Flow</span>
				</h2>
				<p class="text-lg text-gray-600 leading-relaxed max-w-lg">
					Customize the authentication experience for your users. Select providers, choose a
					template, and generate a secure login link instantly.
				</p>
			</div>

			<div class="space-y-8">
				<!-- Template Selection -->
				<div>
					<label class="block text-sm font-semibold text-gray-900 mb-4">Choose Template</label>
					<div class="flex flex-wrap gap-3">
						{#each ['popular', 'all', 'minimal'] as t}
							<button
								class="px-5 py-2.5 text-sm font-medium rounded-full border transition-all duration-200
									{selectedTemplate === t
									? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
									: 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}"
								onclick={() => (selectedTemplate = t)}
							>
								{t.charAt(0).toUpperCase() + t.slice(1)}
							</button>
						{/each}
					</div>
				</div>

				<!-- Provider Selection -->
				<div>
					<label class="block text-sm font-semibold text-gray-900 mb-4">Add Providers</label>
					<div class="flex flex-wrap gap-2.5">
						{#each displayProviders as p}
							<button
								class="px-3.5 py-2 text-sm rounded-lg border transition-all duration-200 flex items-center gap-2
									{selectedIncludes.includes(p)
									? 'bg-blue-50 text-blue-700 border-blue-200 font-medium'
									: 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}"
								onclick={() => toggleInclude(p)}
							>
								{#if selectedIncludes.includes(p)}
									<Check size={14} />
								{/if}
								{p.charAt(0).toUpperCase() + p.slice(1)}
							</button>
						{/each}
					</div>
				</div>

				<!-- Callback URL -->
				<div>
					<label class="block text-sm font-semibold text-gray-900 mb-4">Callback URL</label>
					<div class="flex items-start gap-3">
						{#if isEditingUrl}
							<div class="relative flex-1 max-w-md">
								<input
									bind:this={urlInputRef}
									type="text"
									bind:value={demoCallbackUrl}
									onkeydown={(e) => e.key === 'Enter' && handleUrlSubmit()}
									onblur={handleUrlSubmit}
									class="w-full px-0 py-1 text-lg bg-transparent border-b-2 focus:outline-none transition-colors
										{urlError ? 'border-red-500 text-red-600' : 'border-blue-600 text-gray-900'}"
									placeholder="https://your-app.com"
									autoFocus
								/>
								{#if urlError}
									<p class="absolute top-full left-0 mt-1 text-xs text-red-500">{urlError}</p>
								{/if}
							</div>
							<button
								onclick={handleUrlSubmit}
								class="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
							>
								<Check size={20} />
							</button>
						{:else}
							<div
								class="group flex items-center gap-3 cursor-pointer"
								onclick={() => {
									isEditingUrl = true;
									setTimeout(() => urlInputRef?.focus(), 0);
								}}
							>
								<span
									class="text-lg text-gray-600 border-b-2 border-transparent group-hover:border-gray-200 transition-all"
								>
									{demoCallbackUrl || 'https://your-app.com'}
								</span>
								<Edit2
									size={16}
									class="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
								/>
							</div>
						{/if}
					</div>
					<div class="mt-4">
						<label class="flex items-center gap-3 cursor-pointer group w-max">
							<div class="relative flex items-center">
								<input
									type="checkbox"
									bind:checked={demoEditable}
									class="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 shadow-sm transition-all checked:border-blue-600 checked:bg-blue-600 hover:border-blue-500"
								/>
								<Check
									size={14}
									class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
								/>
							</div>
							<span class="text-sm text-gray-600 group-hover:text-gray-900 transition-colors"
								>Allow users to edit callback URL</span
							>
						</label>
					</div>
				</div>
			</div>

			<!-- Action Button -->
			<div class="pt-8">
				<a
					href={getLoginUrl()}
					class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 hover:bg-black text-white text-lg font-medium rounded-2xl transition-all shadow-xl shadow-gray-200 hover:shadow-2xl hover:-translate-y-0.5"
				>
					<span>Generate Login Link</span>
					<ExternalLink size={20} class="opacity-70" />
				</a>
			</div>
		</div>

		<!-- Right: Preview -->
		<div class="relative lg:sticky lg:top-12">
			<div
				class="absolute -inset-4 bg-gradient-to-tr from-blue-50 to-purple-50 rounded-[2.5rem] -z-10 opacity-70 blur-2xl"
			></div>

			<div
				class="bg-white rounded-3xl shadow-2xl shadow-gray-100 border border-gray-100 overflow-hidden"
			>
				<div
					class="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30"
				>
					<div class="flex items-center gap-2">
						<div class="w-3 h-3 rounded-full bg-red-400"></div>
						<div class="w-3 h-3 rounded-full bg-yellow-400"></div>
						<div class="w-3 h-3 rounded-full bg-green-400"></div>
					</div>
					<div class="text-xs font-mono text-gray-400">Preview</div>
				</div>

				<div class="p-8 lg:p-12">
					<div class="text-center mb-8">
						<h3 class="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h3>
						<p class="text-gray-500">Sign in to continue to your account</p>
					</div>

					<OAuthProviders
						onSocialClickAction={() => {}}
						template={selectedTemplate}
						include={selectedIncludes}
					/>

					<div class="mt-8 text-center">
						<p class="text-xs text-gray-400">
							By continuing, you agree to our Terms of Service and Privacy Policy.
						</p>
					</div>
				</div>
			</div>
		</div>
	</main>
</div>
