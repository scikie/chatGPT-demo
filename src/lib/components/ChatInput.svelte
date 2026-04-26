<script lang="ts">
	import { chatStore } from '$lib/stores/chat.svelte';

	let inputValue = $state('');
	let textareaRef: HTMLTextAreaElement | undefined = $state();
	let isComposing = $state(false);

	function adjustHeight(): void {
		if (textareaRef) {
			textareaRef.style.height = 'auto';
			textareaRef.style.height = Math.min(textareaRef.scrollHeight, 200) + 'px';
		}
	}

	async function handleSubmit(): Promise<void> {
		if (!inputValue.trim() || chatStore.isLoading || isComposing) return;
		const content = inputValue;
		inputValue = '';
		if (textareaRef) {
			textareaRef.style.height = 'auto';
		}
		await chatStore.sendMessage(content);
	}

	function handleKeyDown(e: KeyboardEvent): void {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	}

	function handleCompositionStart(): void {
		isComposing = true;
	}

	function handleCompositionEnd(): void {
		isComposing = false;
	}
</script>

<div class="sticky bottom-0 bg-gradient-to-t from-dark-800 via-dark-800/95 to-transparent pt-6 pb-4 px-4">
	<div class="max-w-3xl mx-auto">
		<div class="relative flex items-end bg-dark-700 rounded-xl border border-dark-600 focus-within:border-dark-500 focus-within:ring-1 focus-within:ring-dark-500 transition-all">
			<textarea
				bind:this={textareaRef}
				bind:value={inputValue}
				oninput={adjustHeight}
				onkeydown={handleKeyDown}
				oncompositionstart={handleCompositionStart}
				oncompositionend={handleCompositionEnd}
				placeholder="发送消息..."
				disabled={chatStore.isLoading}
				class="flex-1 bg-transparent text-dark-100 placeholder-dark-400 resize-none px-4 py-3 focus:outline-none disabled:opacity-50 max-h-[200px] min-h-[48px]"
				rows="1"
			></textarea>
			<button
				onclick={handleSubmit}
				disabled={!inputValue.trim() || chatStore.isLoading}
				class="flex-shrink-0 m-2 p-2 rounded-lg bg-accent hover:bg-accent-light disabled:bg-dark-600 disabled:cursor-not-allowed transition-colors"
				aria-label="发送"
			>
				{#if chatStore.isLoading}
					<svg class="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
				{:else}
					<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7"></path>
					</svg>
				{/if}
			</button>
		</div>
		<p class="text-center text-xs text-dark-400 mt-2">
			ChatGPT 可能会产生错误信息，请核实重要内容。
		</p>
	</div>
</div>
