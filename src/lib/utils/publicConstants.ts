import { env as pubEnv } from '$env/dynamic/public';
export const PUBLIC_AUTH_URL = pubEnv.PUBLIC_AUTH_URL || null;
if (!PUBLIC_AUTH_URL) {
	console.error('PUBLIC_AUTH_URL is required');
}
export const PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY =
	pubEnv.PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || null;
if (!PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY) {
	console.error('PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY is required');
}

export const ALLOWED_SOCIAL_PROVIDERS = [
	'passkey',
	'anonymous',
	'google',
	'github',
	'discord',
	'microsoft',
	'linkedin',
	'facebook',
	'gitlab',
	'huggingface',
	'notion',
	'reddit',
	'slack',
	'spotify',
	'twitter',
	'twitch',
	'vercel'
] as const;
export type SocialProvider = (typeof ALLOWED_SOCIAL_PROVIDERS)[number];

export const OAUTH_TEMPLATES: Record<string, SocialProvider[]> = {
	popular: ['google', 'github', 'discord', 'twitter'],
	developer: ['github', 'gitlab', 'vercel'],
	minimal: ['google', 'anonymous'],
	none: [],
	all: ALLOWED_SOCIAL_PROVIDERS.map((p) => p) as SocialProvider[]
};

export const ENABLE_ANONYMOUS = pubEnv.PUBLIC_ENABLE_ANONYMOUS === 'true';

export const GITHUB_CLIENT_ID = pubEnv.PUBLIC_GITHUB_CLIENT_ID || null;
export const GOOGLE_CLIENT_ID = pubEnv.PUBLIC_GOOGLE_CLIENT_ID || null;
export const DISCORD_CLIENT_ID = pubEnv.PUBLIC_DISCORD_CLIENT_ID || null;
export const MICROSOFT_CLIENT_ID = pubEnv.PUBLIC_MICROSOFT_CLIENT_ID || null;
export const LINKEDIN_CLIENT_ID = pubEnv.PUBLIC_LINKEDIN_CLIENT_ID || null;
export const FACEBOOK_CLIENT_ID = pubEnv.PUBLIC_FACEBOOK_CLIENT_ID || null;
export const GITLAB_CLIENT_ID = pubEnv.PUBLIC_GITLAB_CLIENT_ID || null;
export const GITLAB_ISSUER = pubEnv.PUBLIC_GITLAB_ISSUER || null;
export const HUGGINGFACE_CLIENT_ID = pubEnv.PUBLIC_HUGGINGFACE_CLIENT_ID || null;
export const NOTION_CLIENT_ID = pubEnv.PUBLIC_NOTION_CLIENT_ID || null;
export const REDDIT_CLIENT_ID = pubEnv.PUBLIC_REDDIT_CLIENT_ID || null;
export const SLACK_CLIENT_ID = pubEnv.PUBLIC_SLACK_CLIENT_ID || null;
export const SLACK_CLIENT_TEAM = pubEnv.PUBLIC_SLACK_CLIENT_TEAM || null;
export const SPOTIFY_CLIENT_ID = pubEnv.PUBLIC_SPOTIFY_CLIENT_ID || null;
export const TWITTER_CLIENT_ID = pubEnv.PUBLIC_TWITTER_CLIENT_ID || null;
export const TWITCH_CLIENT_ID = pubEnv.PUBLIC_TWITCH_CLIENT_ID || null;
export const VERCEL_CLIENT_ID = pubEnv.PUBLIC_VERCEL_CLIENT_ID || null;
