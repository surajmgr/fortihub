import { sentrySvelteKit } from "@sentry/sveltekit";
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sentrySvelteKit({
        org: "surajmgr",
        project: "auth-ms"
    }), tailwindcss(), sveltekit()],
	server: {
		host: '0.0.0.0',
		port: 51731,
		hmr: {
			host: 'amac.surajpulami.com.np'
		}
	}
});