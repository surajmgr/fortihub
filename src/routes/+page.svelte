<script lang="ts">
	import OAuthProviders from '$lib/components/auth/OAuthProviders.svelte';
	import { Check, Link, Settings, ExternalLink } from '@lucide/svelte';
	import { ALLOWED_SOCIAL_PROVIDERS, type SocialProvider } from '$lib/utils/publicConstants';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	// Get state from URL to keep in sync with OAuthProviders
	let urlParams = $derived($page.url.searchParams);
	let selectedTemplate = $derived(urlParams.get('template') ?? 'popular');
	let selectedIncludes = $derived(urlParams.get('include')?.split(',').filter(Boolean) ?? []);
	let demoCallbackUrl = $derived(urlParams.get('callbackUrl') ?? '');
	let demoEditable = $derived(urlParams.get('editable') === 'true');

	function updateUrl(updates: Record<string, string | null>) {
		const newParams = new URLSearchParams($page.url.searchParams);
		Object.entries(updates).forEach(([key, value]) => {
			if (value === null) {
				newParams.delete(key);
			} else {
				newParams.set(key, value);
			}
		});
		goto(`?${newParams.toString()}`, { keepFocus: true, noScroll: true, replaceState: true });
	}

	function toggleInclude(provider: string) {
		let newIncludes = [...selectedIncludes];
		if (newIncludes.includes(provider)) {
			newIncludes = newIncludes.filter((p) => p !== provider);
		} else {
			newIncludes = [...newIncludes, provider];
		}
		updateUrl({ include: newIncludes.length ? newIncludes.join(',') : null });
	}

	function getLoginUrl() {
		const params = new URLSearchParams();
		if (selectedTemplate !== 'popular') params.set('template', selectedTemplate);
		if (selectedIncludes.length > 0) params.set('include', selectedIncludes.join(','));
		if (demoCallbackUrl) params.set('callbackUrl', demoCallbackUrl);
		if (demoEditable) params.set('editable', 'true');
		return `/login?${params.toString()}`;
	}

	// Filter providers to show in the list (exclude some internal ones if needed, or show all)
	const displayProviders = ALLOWED_SOCIAL_PROVIDERS.filter(
		(p) => p !== 'passkey' && p !== 'anonymous'
	);
</script>

<div class="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-sans text-gray-900">
	<!-- Left Side: Guide / Info -->
	<div
		class="lg:w-1/2 bg-indigo-600 text-white p-8 lg:p-16 flex flex-col justify-center relative overflow-hidden"
	>
		<div
			class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"
		></div>
		<div
			class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 opacity-90"
		></div>

		<div class="relative z-10 max-w-lg mx-auto lg:mx-0">
			<div class="mb-12">
				<div
					class="h-14 w-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-xl"
				>
					<Settings class="text-white h-7 w-7" />
				</div>
				<h1 class="text-4xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
					Auth<span class="text-indigo-300">Microservice</span>
				</h1>
				<p class="text-indigo-100 text-lg mb-8 leading-relaxed max-w-md">
					A centralized, secure, and highly configurable authentication hub for your entire
					ecosystem.
				</p>
			</div>

			<div class="space-y-8">
				<div class="flex items-start gap-5">
					<div
						class="h-10 w-10 rounded-full bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center flex-shrink-0"
					>
						<Link class="h-5 w-5 text-indigo-200" />
					</div>
					<div>
						<h3 class="font-semibold text-xl mb-2">Universal Login Link</h3>
						<p class="text-indigo-200 text-base leading-relaxed">
							Generate a single login URL configured with your specific requirements.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Right Side: Configuration & Preview -->
	<div
		class="lg:w-1/2 flex flex-col items-center justify-center p-4 lg:p-12 bg-gray-50/50 overflow-y-auto"
	>
		<div class="w-full max-w-xl space-y-8">
			<div
				class="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-white overflow-hidden"
			>
				<div class="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center">
					<div>
						<h2 class="text-xl font-bold text-gray-900">Configuration</h2>
						<p class="text-sm text-gray-500 mt-1">Customize the login experience</p>
					</div>
				</div>

				<div class="p-8 space-y-8">
					<!-- Template Selection -->
					<div>
						<label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3"
							>Template</label
						>
						<div class="flex flex-wrap gap-2">
							{#each ['popular', 'all', 'minimal'] as t}
								<button
									class="px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200
										{selectedTemplate === t
										? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200'
										: 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}"
									onclick={() => updateUrl({ template: t })}
								>
									{t.charAt(0).toUpperCase() + t.slice(1)}
								</button>
							{/each}
						</div>
					</div>

					<!-- Provider Configuration -->
					<div>
						<label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3"
							>Include Providers</label
						>
						<div class="flex flex-wrap gap-2">
							{#each displayProviders as p}
								<button
									class="px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 flex items-center gap-2
										{selectedIncludes.includes(p)
										? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-medium'
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

					<!-- Callback URL Config -->
					<div class="space-y-4 pt-4 border-t border-gray-100">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label
									class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
									>Callback URL</label
								>
								<input
									type="text"
									value={demoCallbackUrl}
									oninput={(e) => updateUrl({ callbackUrl: e.currentTarget.value })}
									class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
									placeholder="https://your-app.com"
								/>
							</div>
							<div class="flex items-center pt-6">
								<label class="flex items-center gap-3 cursor-pointer group">
									<div class="relative flex items-center">
										<input
											type="checkbox"
											checked={demoEditable}
											onchange={(e) =>
												updateUrl({ editable: e.currentTarget.checked ? 'true' : null })}
											class="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 shadow-sm transition-all checked:border-indigo-500 checked:bg-indigo-500 hover:border-indigo-400"
										/>
										<Check
											size={14}
											class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
										/>
									</div>
									<span class="text-sm text-gray-600 group-hover:text-gray-900 transition-colors"
										>Allow editing URL</span
									>
								</label>
							</div>
						</div>
					</div>

					<!-- Preview Area -->
					<div class="pt-6 border-t border-gray-100">
						<div class="flex justify-between items-end mb-4">
							<label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider"
								>Live Preview</label
							>
							<span class="text-xs text-gray-400">Updates in real-time</span>
						</div>
						<div class="bg-gray-50 rounded-2xl p-6 border border-gray-200/60 shadow-inner">
							<OAuthProviders
								onSocialClickAction={() => {}}
								onPasskeyClickAction={() => {}}
								onAnonymousClickAction={() => {}}
							/>
						</div>
					</div>

					<!-- Action -->
					<div class="pt-2">
						<a
							href={getLoginUrl()}
							class="group relative block w-full py-4 px-6 bg-gray-900 hover:bg-gray-800 text-white text-center font-medium rounded-xl transition-all shadow-xl shadow-gray-200 hover:shadow-2xl hover:shadow-gray-300 hover:-translate-y-0.5"
						>
							<div class="flex items-center justify-center gap-2">
								<span>Generate & Go to Login Page</span>
								<ExternalLink
									size={18}
									class="opacity-70 group-hover:opacity-100 transition-opacity"
								/>
							</div>
						</a>
						<p class="text-center text-xs text-gray-400 mt-3 font-mono">
							{getLoginUrl()}
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
