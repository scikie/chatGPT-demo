<script lang="ts">
	import type { Message } from '$lib/types';
	import MarkdownRenderer from './MarkdownRenderer.svelte';

	interface Props {
		content: string;
	}

	let { content }: Props = $props();
</script>

<div class="flex gap-4 px-4 py-6 bg-dark-700/50 animate-pulse">
	<div class="flex-shrink-0">
		<div class="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
			<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.18 5 4.05 5 7.41 0 2.38-1.19 4.47-3 5.74z"/>
			</svg>
		</div>
	</div>
	<div class="flex-1 min-w-0">
		<div class="font-semibold text-sm mb-1 text-accent">ChatGPT</div>
		{#if content}
			<MarkdownRenderer content={content} />
		{:else}
			<div class="flex gap-1">
				<span class="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style="animation-delay: 0ms;"></span>
				<span class="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style="animation-delay: 150ms;"></span>
				<span class="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style="animation-delay: 300ms;"></span>
			</div>
		{/if}
	</div>
</div>
