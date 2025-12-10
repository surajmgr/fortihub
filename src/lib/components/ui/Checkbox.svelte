<script lang="ts">
	interface Props {
		id?: string;
		label?: string;
		checked?: boolean;
		disabled?: boolean;
		class?: string;
		onchange?: (checked: boolean) => void;
	}

	let {
		id,
		label,
		checked = $bindable(false),
		disabled = false,
		class: className = '',
		onchange
	}: Props = $props();

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		checked = target.checked;
		onchange?.(target.checked);
	}
</script>

<div class={`flex items-start space-x-2 ${className}`}>
	<input
		{id}
		type="checkbox"
		bind:checked
		{disabled}
		onchange={handleChange}
		class="h-4 w-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
	/>
	{#if label}
		<label
			for={id}
			class="text-sm text-gray-600 cursor-pointer select-none leading-5 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
		>
			{label}
		</label>
	{/if}
</div>
