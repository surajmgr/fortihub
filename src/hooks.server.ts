import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { auth } from '$lib/auth/server';
import { building } from '$app/environment';

export const handle: Handle = ({ event, resolve }) => {
    return svelteKitHandler({ event, resolve, auth, building });
}
