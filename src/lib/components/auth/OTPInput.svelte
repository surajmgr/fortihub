<script lang="ts">
	interface Props {
		otp: string[];
		isLoading?: boolean;
		onOtpChange?: (otp: string[]) => void;
	}

	let { otp, isLoading = false, onOtpChange }: Props = $props();

	// Move focus to an index if valid
	function focusIndex(i: number) {
		const el = document.getElementById(`otp-${i}`) as HTMLInputElement;
		if (el) el.focus();
	}

	function handleInput(i: number, e: Event) {
		const input = e.target as HTMLInputElement;
		let val = input.value.replace(/\D/g, '').slice(0, 1); // only 1 digit

		otp[i] = val;
		onOtpChange?.([...otp]);

		if (val && i < otp.length - 1) {
			focusIndex(i + 1);
		}
	}

	function handleKeydown(i: number, e: KeyboardEvent) {
		const input = e.target as HTMLInputElement;

		if (e.key === 'Backspace' && !input.value && i > 0) {
			focusIndex(i - 1);
		}
	}

	function handlePaste(e: ClipboardEvent) {
		e.preventDefault();
		const text = e.clipboardData?.getData('text') || '';
		if (!text) return;

		let arr = text.split('');

		arr.forEach((char, idx) => {
			if (idx < otp.length) otp[idx] = char;
		});

		onOtpChange?.([...otp]);

		const nextIndex = Math.min(arr.length, otp.length - 1);
		focusIndex(nextIndex);
	}
</script>

<div class="flex gap-2 justify-center" onpaste={handlePaste}>
	{#each Array(otp.length).keys() as i}
		<input
			id="otp-{i}"
			type="text"
			inputmode="numeric"
			maxlength="1"
			class="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg
			       focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
			bind:value={otp[i]}
			disabled={isLoading}
			autocomplete="off"
			oninput={(e) => handleInput(i, e)}
			onkeydown={(e) => handleKeydown(i, e)}
		/>
	{/each}
</div>
