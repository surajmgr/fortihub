<script lang="ts">
	import Input from '$lib/components/ui/Input.svelte';
	import { Eye, EyeOff, Lock } from '@lucide/svelte';

	interface Props {
		id: string;
		label: string;
		value?: string;
		onChangeAction: (value: string) => void;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		minLength?: number;
	}

	let {
		id,
		label,
		value = $bindable(''),
		onChangeAction,
		placeholder = 'Enter password',
		required = false,
		disabled = false,
		minLength = 8
	}: Props = $props();

	let showPassword = $state(false);

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		onChangeAction(target.value);
	}
</script>

<div>
	<label for={id} class="block text-sm font-medium text-gray-700 mb-2">
		{label}
	</label>
	<div class="relative">
		<Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
		<Input
			{id}
			type={showPassword ? 'text' : 'password'}
			bind:value
			onchange={handleChange}
			{placeholder}
			class="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
			{disabled}
			autocomplete="off"
		/>
		<button
			type="button"
			onclick={() => (showPassword = !showPassword)}
			class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
		>
			{#if showPassword}
				<EyeOff class="w-5 h-5" />
			{:else}
				<Eye class="w-5 h-5" />
			{/if}
		</button>
	</div>
</div>
