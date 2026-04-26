<script lang="ts">
	import { chatStore } from '$lib/stores/chat.svelte';
	import { themeStore } from '$lib/stores/theme.svelte';

	let editingId = $state<string | null>(null);
	let editTitle = $state('');
	let confirmDelete = $state<string | null>(null);

	function handleSelect(id: string): void {
		chatStore.selectConversation(id);
	}

	function handleNewChat(): void {
		const currentConv = chatStore.activeConversation;
		if (currentConv && currentConv.messages.length > 0) {
			chatStore.saveConversations();
		}
		chatStore.createNewConversation();
	}

	function handleDelete(id: string): void {
		chatStore.deleteConversation(id);
		confirmDelete = null;
	}

	function startEdit(id: string, currentTitle: string): void {
		editingId = id;
		editTitle = currentTitle;
	}

	function handleEditKeydown(e: KeyboardEvent): void {
		if (e.key === 'Enter') {
			if (editingId && editTitle.trim()) {
				chatStore.renameConversation(editingId, editTitle.trim());
			}
			editingId = null;
			editTitle = '';
		}
		if (e.key === 'Escape') {
			editingId = null;
			editTitle = '';
		}
	}

	function handleEditBlur(): void {
		if (editingId && editTitle.trim()) {
			chatStore.renameConversation(editingId, editTitle.trim());
		}
		editingId = null;
		editTitle = '';
	}

	function handleConversationClick(e: MouseEvent, id: string): void {
		if (editingId === id) return;
		if (confirmDelete === id) return;
		const target = e.target as HTMLElement;
		if (target.closest('.action-buttons')) return;
		handleSelect(id);
	}
</script>

<aside class="flex flex-col w-64 h-full bg-dark-900 text-dark-100">
	<div class="p-3">
		<button
			onclick={handleNewChat}
			class="w-full flex items-center gap-2 px-3 py-3 border border-dark-600 rounded-lg hover:bg-dark-700 transition-colors"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
			</svg>
			<span>新对话</span>
		</button>
	</div>

	<div class="flex-1 overflow-y-auto px-2">
		<div class="text-xs text-dark-400 px-2 py-2">历史记录</div>
		{#each chatStore.sortedConversations as conv (conv.id)}
			<div
				class="group relative flex items-center gap-2 px-3 py-2 my-1 rounded-lg cursor-pointer transition-colors {chatStore.activeConversationId === conv.id ? 'bg-dark-700' : 'hover:bg-dark-700/50'}"
				onclick={(e) => handleConversationClick(e, conv.id)}
				onkeydown={(e) => e.key === 'Enter' && handleSelect(conv.id)}
				role="button"
				tabindex="0"
			>
				<svg class="w-4 h-4 text-dark-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
				</svg>
				
				{#if editingId === conv.id}
					<input
						type="text"
						bind:value={editTitle}
						onkeydown={handleEditKeydown}
						onblur={handleEditBlur}
						onclick={(e) => e.stopPropagation()}
						class="flex-1 bg-dark-600 text-sm px-1 py-0.5 rounded text-dark-100 focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				{:else}
					<span class="flex-1 text-sm truncate">{conv.title}</span>
				{/if}

				{#if confirmDelete === conv.id}
					<div class="action-buttons flex gap-1" onclick={(e) => e.stopPropagation()}>
						<button
							onclick={() => handleDelete(conv.id)}
							class="p-1 text-red-400 hover:text-red-300"
							title="确认删除"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
						</button>
						<button
							onclick={() => confirmDelete = null}
							class="p-1 text-dark-400 hover:text-dark-300"
							title="取消"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
							</svg>
						</button>
					</div>
				{:else if editingId !== conv.id}
					<div class="action-buttons hidden group-hover:flex gap-1" onclick={(e) => e.stopPropagation()}>
						<button
							onclick={() => startEdit(conv.id, conv.title)}
							class="p-1 text-dark-400 hover:text-dark-100"
							title="重命名"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.768 3.768m-3.768-3.768a2.5 2.5 0 113.536 3.536l-10.6 10.6H4v-3.536l10.6-10.6z"></path>
							</svg>
						</button>
						<button
							onclick={() => confirmDelete = conv.id}
							class="p-1 text-dark-400 hover:text-red-400"
							title="删除"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
							</svg>
						</button>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<div class="p-3 border-t border-dark-700">
		<button
			onclick={() => themeStore.toggle()}
			class="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-700 transition-colors"
		>
			{#if themeStore.theme === 'dark'}
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
				</svg>
				<span>浅色模式</span>
			{:else}
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
				</svg>
				<span>深色模式</span>
			{/if}
		</button>
	</div>
</aside>
