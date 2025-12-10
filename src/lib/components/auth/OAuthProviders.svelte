<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/Button.svelte';
	import {
		GITHUB_CLIENT_ID,
		GOOGLE_CLIENT_ID,
		type SocialProvider,
		ALLOWED_SOCIAL_PROVIDERS,
		VERCEL_CLIENT_ID,
		DISCORD_CLIENT_ID,
		MICROSOFT_CLIENT_ID,
		LINKEDIN_CLIENT_ID,
		FACEBOOK_CLIENT_ID,
		GITLAB_CLIENT_ID,
		HUGGINGFACE_CLIENT_ID,
		NOTION_CLIENT_ID,
		REDDIT_CLIENT_ID,
		SLACK_CLIENT_ID,
		SPOTIFY_CLIENT_ID,
		TWITTER_CLIENT_ID,
		TWITCH_CLIENT_ID,
		OAUTH_TEMPLATES,
		ENABLE_ANONYMOUS
	} from '$lib/utils/publicConstants';
	import { SvelteSet } from 'svelte/reactivity';
	import SocialIcons from '../ui/SocialIcons.svelte';

	interface Props {
		onSocialClickAction: (provider: SocialProvider) => void;
		isLoading?: boolean;
		template?: string;
		include?: string[];
		exclude?: string[];
		disable?: string[];
	}

	let {
		onSocialClickAction,
		isLoading = false,
		template,
		include,
		exclude,
		disable
	}: Props = $props();

	const urlParams = $derived($page.url.searchParams);

	const templateParam = $derived(template ?? urlParams.get('template') ?? 'popular');
	const inclusionParam = $derived(include ?? urlParams.get('include')?.split(',') ?? []);
	const disclusionParam = $derived(exclude ?? urlParams.get('exclude')?.split(',') ?? []);
	const disableParam = $derived(disable ?? urlParams.get('disable')?.split(',') ?? []);

	const allDisclusions = $derived([...disclusionParam, ...disableParam]);

	const allProviderConfigs: {
		provider: SocialProvider;
		label: string;
		clientId: string | undefined | null;
	}[] = [
		{
			provider: 'passkey',
			label: 'Continue with Passkey',
			clientId: 'passkey'
		},
		{
			provider: 'anonymous',
			label: 'Continue as Guest',
			clientId: ENABLE_ANONYMOUS ? 'anonymous' : undefined
		},
		{
			provider: 'google',
			label: 'Continue with Google',
			clientId: GOOGLE_CLIENT_ID
		},
		{
			provider: 'github',
			label: 'Continue with GitHub',
			clientId: GITHUB_CLIENT_ID
		},
		{
			provider: 'discord',
			label: 'Continue with Discord',
			clientId: DISCORD_CLIENT_ID
		},
		{
			provider: 'microsoft',
			label: 'Continue with Microsoft',
			clientId: MICROSOFT_CLIENT_ID
		},
		{
			provider: 'linkedin',
			label: 'Continue with LinkedIn',
			clientId: LINKEDIN_CLIENT_ID
		},
		{
			provider: 'facebook',
			label: 'Continue with Facebook',
			clientId: FACEBOOK_CLIENT_ID
		},
		{
			provider: 'gitlab',
			label: 'Continue with GitLab',
			clientId: GITLAB_CLIENT_ID
		},
		{
			provider: 'huggingface',
			label: 'Continue with Huggingface',
			clientId: HUGGINGFACE_CLIENT_ID
		},
		{
			provider: 'notion',
			label: 'Continue with Notion',
			clientId: NOTION_CLIENT_ID
		},
		{
			provider: 'reddit',
			label: 'Continue with Reddit',
			clientId: REDDIT_CLIENT_ID
		},
		{
			provider: 'slack',
			label: 'Continue with Slack',
			clientId: SLACK_CLIENT_ID
		},
		{
			provider: 'spotify',
			label: 'Continue with Spotify',
			clientId: SPOTIFY_CLIENT_ID
		},
		{
			provider: 'twitter',
			label: 'Continue with Twitter',
			clientId: TWITTER_CLIENT_ID
		},
		{
			provider: 'twitch',
			label: 'Continue with Twitch',
			clientId: TWITCH_CLIENT_ID
		},
		{
			provider: 'vercel',
			label: 'Continue with Vercel',
			clientId: VERCEL_CLIENT_ID
		}
	];

	const activeProviders = $derived.by(() => {
		let baseProviders = OAUTH_TEMPLATES[templateParam] || OAUTH_TEMPLATES['popular'];
		if (baseProviders.length === 0 && templateParam !== 'none') {
			baseProviders = OAUTH_TEMPLATES['popular'];
		}

		// Start with base template
		let active = new SvelteSet(baseProviders);

		// Add inclusions
		inclusionParam.forEach((p) => {
			if (ALLOWED_SOCIAL_PROVIDERS.includes(p as SocialProvider)) {
				active.add(p as SocialProvider);
			}
		});

		// Remove disclusions
		allDisclusions.forEach((p) => {
			active.delete(p as SocialProvider);
		});

		return Array.from(active)
			.map((p) => allProviderConfigs.find((c) => c.provider === p))
			.filter(
				(c): c is (typeof allProviderConfigs)[0] =>
					!!c && ALLOWED_SOCIAL_PROVIDERS.includes(c.provider) && !!c.clientId
			);
	});

	const providerCount = $derived(activeProviders.length);

	// Adaptive layout classes
	let containerClass = $derived(providerCount > 3 ? 'grid grid-cols-4 gap-2' : 'space-y-3');
	let buttonClass = $derived(
		providerCount > 3
			? 'w-full flex items-center justify-center py-2 px-0'
			: 'w-full flex items-center justify-center py-3'
	);
	let iconClass = $derived(providerCount > 3 ? 'h-5 w-5' : 'mr-2 h-5 w-5');
	let showLabel = $derived(providerCount <= 3);
</script>

<div class={containerClass}>
	{#each activeProviders as config}
		<Button
			variant="outline"
			class={buttonClass}
			onclick={() => onSocialClickAction(config.provider)}
			disabled={isLoading}
			title={config.label}
		>
			<SocialIcons iconName={config.provider} class={iconClass} />
			{#if showLabel}
				{config.label}
			{/if}
		</Button>
	{/each}
</div>

{#if activeProviders.length > 0}
	<div class="relative my-6">
		<div class="absolute inset-0 flex items-center">
			<div class="w-full border-t border-gray-200"></div>
		</div>
		<div class="relative flex justify-center text-sm">
			<span class="px-4 bg-white text-gray-500">or</span>
		</div>
	</div>
{/if}
