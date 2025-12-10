<script lang="ts">
	import type { FullAutoFill } from 'svelte/elements';

	interface Props {
		id?: string;
		type?: string;
		placeholder?: string;
		value?: string;
		disabled?: boolean;
		class?: string;
		autocomplete?: FullAutoFill | null;
		inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
		minlength?: number;
		maxlength?: number;
		variant?: 'default' | 'outline' | 'ghost';
		required?: boolean;
		onchange?: (e: Event) => void;
		onkeydown?: (e: KeyboardEvent) => void;
	}

	let {
		id,
		type = 'text',
		placeholder,
		value = $bindable(''),
		disabled = false,
		class: className = '',
		autocomplete = 'off',
		inputmode,
		minlength,
		maxlength,
		variant = 'default',
		required = false,
		onchange,
		onkeydown
	}: Props = $props();

	const baseClasses =
		'w-full px-3 py-2 rounded-md border text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70';

	const variantClasses = {
		default: 'border-gray-300 focus-visible:ring-blue-600',
		outline: 'border-gray-400 bg-white focus-visible:ring-gray-500',
		ghost: 'border-transparent bg-gray-50 focus-visible:ring-gray-400'
	};

	const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;
</script>

<input
	{id}
	{type}
	{placeholder}
	bind:value
	{disabled}
	class={classes}
	autocomplete={autocomplete || undefined}
	{inputmode}
	{minlength}
	{maxlength}
	{required}
	oninput={onchange}
	{onkeydown}
/>
