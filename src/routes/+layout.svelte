<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';
	import { Toaster } from 'svelte-5-french-toast';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>FortiHub</title>
	<meta name="description" content="FortiHub Authentication Service" />
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
