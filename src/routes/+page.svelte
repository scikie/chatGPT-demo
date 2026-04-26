<script lang="ts">
	import { onMount } from 'svelte';
	import { chatStore } from '$lib/stores/chat.svelte';
	import ChatMessage from '$lib/components/ChatMessage.svelte';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import StreamingMessage from '$lib/components/StreamingMessage.svelte';

	let messagesContainer: HTMLDivElement | undefined = $state();

	function scrollToBottom(): void {
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}

	$effect(() => {
		if (chatStore.activeConversation?.messages) {
			scrollToBottom();
		}
	});

	$effect(() => {
		if (chatStore.streamingContent) {
			scrollToBottom();
		}
	});

	onMount(() => {
		if (!chatStore.activeConversationId && chatStore.conversations.length === 0) {
			chatStore.createNewConversation();
		} else if (!chatStore.activeConversationId && chatStore.conversations.length > 0) {
			chatStore.selectConversation(chatStore.conversations[0].id);
		}
		scrollToBottom();
	});

	function handleClearChat(): void {
		chatStore.clearMessages();
	}
</script>

<div class="flex-1 flex flex-col overflow-hidden">
	<header class="flex items-center justify-between px-4 py-3 border-b border-dark-700 bg-dark-800">
		<h1 class="text-lg font-semibold text-dark-100">
			{chatStore.activeConversation?.title ?? '新对话'}
		</h1>
		{#if chatStore.activeConversation?.messages.length}
			<button
				onclick={handleClearChat}
				class="flex items-center gap-2 px-3 py-1.5 text-sm text-dark-400 hover:text-dark-100 hover:bg-dark-700 rounded-lg transition-colors"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
				</svg>
				清空对话
			</button>
		{/if}
	</header>

	<div bind:this={messagesContainer} class="flex-1 overflow-y-auto">
		{#if chatStore.activeConversation?.messages.length}
			{#each chatStore.activeConversation.messages as message (message.id)}
				<ChatMessage {message} />
			{/each}
			{#if chatStore.isLoading && chatStore.streamingContent}
				<StreamingMessage content={chatStore.streamingContent} />
			{:else if chatStore.isLoading}
				<div class="flex gap-4 px-4 py-6 bg-dark-700/50">
					<div class="flex-shrink-0">
						<div class="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
							<svg class="w-5 h-5 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.18 5 4.05 5 7.41 0 2.38-1.19 4.47-3 5.74z"/>
							</svg>
						</div>
					</div>
					<div class="flex-1">
						<div class="font-semibold text-sm mb-1 text-accent">ChatGPT</div>
						<div class="flex gap-1">
							<span class="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style="animation-delay: 0ms;"></span>
							<span class="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style="animation-delay: 150ms;"></span>
							<span class="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style="animation-delay: 300ms;"></span>
						</div>
					</div>
				</div>
			{/if}
		{:else}
			<div class="flex-1 flex flex-col items-center justify-center text-center px-4">
				<div class="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
					<svg class="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.18 5 4.05 5 7.41 0 2.38-1.19 4.47-3 5.74z"/>
					</svg>
				</div>
				<h2 class="text-2xl font-semibold text-dark-100 mb-2">ChatGPT</h2>
				<p class="text-dark-400 max-w-md">
					我可以帮你回答问题、写作、编程、翻译等各种任务。请在下方输入你的问题。
				</p>
			</div>
		{/if}
	</div>

	{#if chatStore.error}
		<div class="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
			<p class="text-red-400 text-sm text-center">{chatStore.error}</p>
		</div>
	{/if}

	<ChatInput />
</div>
