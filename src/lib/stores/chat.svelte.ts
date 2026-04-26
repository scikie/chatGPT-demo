import { browser } from '$app/environment';
import type { Conversation, Message, ChatRequest, ChatResponse, HistoryResponse } from '$lib/types';

const API_BASE = 'http://localhost:8888';

function generateId(): string {
	return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function createChatStore() {
	let conversations = $state<Conversation[]>([]);
	let activeConversationId = $state<string>('');
	let isLoading = $state(false);
	let streamingContent = $state('');
	let error = $state<string | null>(null);

	const activeConversation = $derived(
		conversations.find((c) => c.id === activeConversationId)
	);

	const sortedConversations = $derived(
		[...conversations].sort((a, b) => b.updatedAt - a.updatedAt)
	);

	async function loadConversations(): Promise<void> {
		try {
			const saved = localStorage.getItem('chatgpt-conversations');
			if (saved) {
				conversations = JSON.parse(saved);
			}
		} catch (e) {
			console.error('Failed to load conversations:', e);
		}
	}

	function saveConversations(): void {
		if (browser) {
			localStorage.setItem('chatgpt-conversations', JSON.stringify(conversations));
		}
	}

	function createNewConversation(): void {
		const newConv: Conversation = {
			id: generateId(),
			title: '新对话',
			messages: [],
			createdAt: Date.now(),
			updatedAt: Date.now()
		};
		conversations = [newConv, ...conversations];
		activeConversationId = newConv.id;
		saveConversations();
	}

	function selectConversation(id: string): void {
		activeConversationId = id;
	}

	function deleteConversation(id: string): void {
		conversations = conversations.filter((c) => c.id !== id);
		if (activeConversationId === id) {
			activeConversationId = conversations[0]?.id ?? '';
		}
		saveConversations();
	}

	function renameConversation(id: string, newTitle: string): void {
		const conv = conversations.find((c) => c.id === id);
		if (conv) {
			conv.title = newTitle;
			saveConversations();
		}
	}

	async function sendMessage(content: string): Promise<void> {
		if (!activeConversationId || !content.trim() || isLoading) return;

		const conv = conversations.find((c) => c.id === activeConversationId);
		if (!conv) return;

		const userMessage: Message = {
			id: generateId(),
			role: 'user',
			content: content.trim(),
			timestamp: Date.now()
		};

		conv.messages.push(userMessage);
		if (conv.messages.length === 1) {
			conv.title = content.trim().substring(0, 30) + (content.length > 30 ? '...' : '');
		}
		conv.updatedAt = Date.now();
		saveConversations();
		error = null;
		isLoading = true;
		streamingContent = '';

		try {
			const response = await fetch(`${API_BASE}/chat`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					conversation_id: activeConversationId,
					role: 'user',
					content: content.trim()
				} as ChatRequest)
			});

			if (!response.ok) {
				throw new Error(`Server error: ${response.status}`);
			}

			const data: ChatResponse = await response.json();
			const sessionToken = data.sessionToken;
			activeConversationId = data.conversation_id;

			if (!conversations.find((c) => c.id === activeConversationId)) {
				const newConv: Conversation = {
					id: activeConversationId,
					title: content.trim().substring(0, 30),
					messages: [],
					createdAt: Date.now(),
					updatedAt: Date.now()
				};
				conversations = [newConv, ...conversations];
			}

			const assistantContent = await streamResponse(sessionToken);
			const assistantMessage: Message = {
				id: generateId(),
				role: 'assistant',
				content: assistantContent,
				timestamp: Date.now()
			};

			const currentConv = conversations.find((c) => c.id === activeConversationId);
			if (currentConv) {
				currentConv.messages.push(assistantMessage);
				currentConv.updatedAt = Date.now();
				saveConversations();
			}
		} catch (e) {
			error = e instanceof Error ? e.message : '发送失败，请重试';
			console.error('Send message error:', e);
		} finally {
			isLoading = false;
			streamingContent = '';
		}
	}

	async function streamResponse(sessionToken: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const eventSource = new EventSource(`${API_BASE}/chat/stream?sessionToken=${sessionToken}`);
			let fullContent = '';
			let lastChunk = '';

			const isEnglish = (word: string) => /^[A-Za-z\s]+$/.test(word);
			const isChinese = (word: string) => /^[\u4e00-\u9fa5]+$/.test(word);

			eventSource.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					const chunk = data.content ?? '';
					if (isEnglish(chunk) && lastChunk && isEnglish(lastChunk)) {
						fullContent += ' ' + chunk;
					} else {
						fullContent += chunk;
					}
					lastChunk = chunk;
					streamingContent = fullContent;
				} catch (e) {
					console.error('Parse SSE error:', e);
				}
			};

			eventSource.addEventListener('done', () => {
				eventSource.close();
				resolve(fullContent);
			});

			eventSource.onerror = (e) => {
				eventSource.close();
				reject(e);
			};
		});
	}

	async function loadHistory(conversationId: string): Promise<void> {
		try {
			const response = await fetch(`${API_BASE}/history?conversation_id=${conversationId}`);
			if (!response.ok) throw new Error(`Server error: ${response.status}`);
			const data: HistoryResponse = await response.json();
			
			const conv = conversations.find((c) => c.id === conversationId);
			if (conv && data.data) {
				conv.messages = data.data;
				conv.updatedAt = Date.now();
				saveConversations();
			}
		} catch (e) {
			console.error('Load history error:', e);
			throw e;
		}
	}

	function clearMessages(): void {
		if (activeConversationId) {
			const conv = conversations.find((c) => c.id === activeConversationId);
			if (conv) {
				conv.messages = [];
				conv.title = '新对话';
				conv.updatedAt = Date.now();
				saveConversations();
			}
		}
	}

	return {
		get conversations() { return conversations; },
		get activeConversationId() { return activeConversationId; },
		get activeConversation() { return activeConversation; },
		get sortedConversations() { return sortedConversations; },
		get isLoading() { return isLoading; },
		get streamingContent() { return streamingContent; },
		get error() { return error; },
		set activeConversationId(id: string) { activeConversationId = id; },
		loadConversations,
		saveConversations,
		createNewConversation,
		selectConversation,
		deleteConversation,
		renameConversation,
		sendMessage,
		loadHistory,
		clearMessages
	};
}

export const chatStore = createChatStore();

if (browser) {
	chatStore.loadConversations();
}
