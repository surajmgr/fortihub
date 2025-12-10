<script lang="ts">
	import LoginPage from '$lib/components/auth/LoginPage.svelte';
	import { PUBLIC_APP_NAME } from '$lib/utils/publicConstants';
</script>

<svelte:head>
	<title>Login - {PUBLIC_APP_NAME}</title>
	<meta name="description" content="Login to your {PUBLIC_APP_NAME} account." />
	<style>
		body {
			/* For Firefox */
			scrollbar-width: none;
			/* For Internet Explorer and Edge */
			-ms-overflow-style: none;
		}

		/* For Chrome, Safari, and Opera */
		body::-webkit-scrollbar {
			display: none;
		}
	</style>
</svelte:head>
<LoginPage />
