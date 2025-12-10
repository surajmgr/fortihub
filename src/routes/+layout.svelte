<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';
	import { Toaster } from 'svelte-5-french-toast';
	import { PUBLIC_APP_NAME } from '$lib/utils/publicConstants';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{PUBLIC_APP_NAME}</title>
	<meta name="description" content={`${PUBLIC_APP_NAME} Authentication Service`} />
</svelte:head>

{@render children()}

<Toaster
	position="top-center"
	reverseOrder={false}
	gutter={8}
	containerClassName=""
	toastOptions={{
		className: '',
		duration: 5000,
		style: 'background: #363636; color: #fff'
	}}
/>

<div class="w-full p-4 bg-gray-50 border-t border-gray-200">
	<div class="flex items-center justify-center gap-2">
		<div class="text-sm text-gray-500">
			© {new Date().getFullYear()}
			{PUBLIC_APP_NAME}. All rights reserved.
		</div>
		<div class="text-sm text-gray-500">OneSignal Verification code: OS7K3L</div>
	</div>
</div>
