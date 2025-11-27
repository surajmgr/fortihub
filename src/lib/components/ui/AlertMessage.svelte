<script lang="ts">
	import { toast } from 'svelte-5-french-toast';
	import { onMount } from 'svelte';

	interface Props {
		type: 'error' | 'success' | 'info' | 'warning';
		message: string;
	}

	let { type, message }: Props = $props();

	onMount(() => {
		if (type === 'error') {
			toast.error(message);
		} else if (type === 'success') {
			toast.success(message);
		} else {
			toast(message);
		}
	});
</script>

<div
	class="rounded-lg p-4 mb-4 {type === 'error'
		? 'bg-red-50 text-red-800 border border-red-200'
		: type === 'success'
			? 'bg-green-50 text-green-800 border border-green-200'
			: type === 'warning'
				? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
				: 'bg-blue-50 text-blue-800 border border-blue-200'}"
>
	<p class="text-sm font-medium">{message}</p>
</div>
