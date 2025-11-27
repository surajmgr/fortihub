<script lang="ts">
	interface Props {
		type?: 'button' | 'submit' | 'reset';
		variant?: 'default' | 'outline' | 'ghost' | 'link';
		size?: 'default' | 'small';
		disabled?: boolean;
		class?: string;
		onclick?: (e: MouseEvent) => void;
		children?: any;
	}

	const ignoreSize = ['link'];

	let {
		type = 'button',
		variant = 'default',
		size = 'default',
		disabled = false,
		class: className = '',
		onclick,
		children
	}: Props = $props();

	const baseClasses =
		'inline-flex items-center justify-center rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

	const variantClasses = {
		default: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600',
		outline:
			'border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 focus-visible:ring-gray-400',
		ghost: 'hover:bg-gray-100 text-gray-900',
		link: 'text-blue-600 underline-offset-4 hover:underline p-0'
	};

	const sizeClasses = {
		default: 'h-12 text-base font-medium px-6',
		small: 'h-10 text-sm font-medium px-4',
		none: ''
	};

	const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[ignoreSize.includes(variant) ? 'none' : size]} ${className}`;
</script>

<button {type} {disabled} class={classes} {onclick}>
	{@render children?.()}
</button>
