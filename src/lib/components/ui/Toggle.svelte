<script lang="ts">
	interface Props {
		id?: string;
		label?: string;
		checked?: boolean;
		disabled?: boolean;
		onchange?: (checked: boolean) => void;
	}

	let { id, label, checked = $bindable(false), disabled = false, onchange }: Props = $props();

	function handleChange(e: Event) {
		// Prevent default if disabled handled by input
		const target = e.target as HTMLInputElement;
		checked = target.checked;
		onchange?.(target.checked);
	}
</script>

<div class="flex items-center justify-between py-3">
	{#if label}
		<label
			for={id}
			class="text-sm font-medium text-gray-700 cursor-pointer select-none flex-1 mr-4"
		>
			{label}
		</label>
	{/if}

	<label class="relative inline-flex items-center cursor-pointer">
		<input
			{id}
			type="checkbox"
			bind:checked
			{disabled}
			onchange={handleChange}
			class="sr-only peer"
		/>
		<div
			class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
		></div>
	</label>
</div>
