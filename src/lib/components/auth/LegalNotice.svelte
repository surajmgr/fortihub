<script lang="ts">
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import toast from 'svelte-5-french-toast';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
	let checked = $state(true);

	function handleClick() {
		checked = true;
		toast('You can opt-out of marketing emails at any time in your account settings.');
	}
</script>

<div class={`space-y-2 ${className}`}>
	<div class="flex items-start space-x-2">
		<Checkbox bind:checked onchange={handleClick} class="mt-1" />
		<span class="text-sm text-gray-600 leading-normal">
			I agree to receive product updates and marketing emails from this service.
		</span>
	</div>
	<div class="text-xs text-gray-500">
		By continuing, you agree to our <a
			href="/terms"
			class="text-blue-600 hover:underline"
			target="_blank">Terms of Service</a
		>
		and <a href="/privacy" class="text-blue-600 hover:underline" target="_blank">Privacy Policy</a>.
	</div>
</div>
