<script lang="ts">
	import MarkdownRenderer from './MarkdownRenderer.svelte';
	import type { Message } from '$lib/types';

	interface Props {
		message: Message;
	}

	let { message }: Props = $props();
	const isUser = $derived(message.role === 'user');
</script>

<div class="flex gap-4 px-4 py-6 {isUser ? 'bg-transparent' : 'bg-dark-700/50'}">
	<div class="flex-shrink-0">
		{#if isUser}
			<div class="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center">
				<svg class="w-5 h-5 text-dark-300" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
				</svg>
			</div>
		{:else}
			<div class="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
				<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.18 5 4.05 5 7.41 0 2.38-1.19 4.47-3 5.74z"/>
				</svg>
			</div>
		{/if}
	</div>
	<div class="flex-1 min-w-0">
		<div class="font-semibold text-sm mb-1 {isUser ? 'text-dark-300' : 'text-accent'}">
			{isUser ? '你' : 'ChatGPT'}
		</div>
		<div class="text-dark-100 leading-relaxed">
			{#if isUser}
				<p class="whitespace-pre-wrap">{message.content}</p>
			{:else}
				<MarkdownRenderer content={message.content} />
			{/if}
		</div>
	</div>
</div>
