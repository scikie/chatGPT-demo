/**
 * ============================================================
 * 📚 聊天状态管理 - chat.svelte.ts
 * ============================================================
 * 
 * 【什么是 Store？】
 * Store 是 Svelte 的跨组件状态管理方案
 * 当多个组件需要访问同一状态时使用
 * 
 * 【Store 的类型】
 * 1. Writable Store: 可读可写
 *    import { writable } from 'svelte/store';
 *    const count = writable(0);
 * 
 * 2. Readable Store: 只读（派生）
 *    import { derived } from 'svelte/store';
 *    const doubleCount = derived(count, $count => $count * 2);
 * 
 * 【Svelte 5 的变化】
 * Svelte 5 引入了 Runes（$state, $derived, $effect）
 * 可以在 .svelte.ts 文件中使用 Runes 创建响应式状态
 * 文件名以 .svelte.ts 结尾，表示这是 Svelte 的 TypeScript 模块
 */

/**
 * 【导入 SvelteKit 环境检测】
 * browser 是一个布尔值，表示代码是否在浏览器环境运行
 * 
 * 【为什么要检测环境？】
 * SvelteKit 支持服务端渲染（SSR）
 * 代码可能在服务器或浏览器执行
 * localStorage 只在浏览器可用
 */
import { browser } from '$app/environment';

/**
 * 【导入类型定义】
 * 从 types 目录导入接口定义
 */
import type { Conversation, Message, ChatRequest, ChatResponse, HistoryResponse } from '$lib/types';

/**
 * 【API 基础地址】
 * 后端 API 的地址
 * 生产环境应该使用环境变量配置
 */
const API_BASE = 'http://localhost:8888';

/**
 * 【工具函数：生成唯一 ID】
 * 使用 Math.random() 和 Date.now() 组合生成
 * 
 * 【更好的方案】
 * 生产环境建议使用 UUID 库：
 * - crypto.randomUUID()（现代浏览器原生支持）
 * - uuid npm 包
 */
function generateId(): string {
	return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * 【创建聊天 Store】
 * 
 * 【设计模式：工厂函数】
 * 使用函数创建 store，而不是直接导出对象
 * 这样可以：
 * 1. 保持状态私有
 * 2. 控制状态的访问方式（getter）
 * 3. 方便测试和扩展
 * 
 * 【类比】
 * 类似于 Vue 3 的 Composition API 或 React 的 Custom Hook
 */
function createChatStore() {
	/**
	 * 【状态定义 - 使用 $state rune】
	 * 
	 * 【conversations】
	 * 所有对话的列表，每个对话包含多条消息
	 * 
	 * 【activeConversationId】
	 * 当前活动的对话 ID
	 * 
	 * 【isLoading】
	 * 是否正在等待 AI 回复
	 * 
	 * 【streamingContent】
	 * 流式传输中的内容（打字机效果）
	 * 
	 * 【error】
	 * 错误信息
	 */
	let conversations = $state<Conversation[]>([]);
	let activeConversationId = $state<string>('');
	let isLoading = $state(false);
	let streamingContent = $state('');
	let error = $state<string | null>(null);

	/**
	 * 【派生状态：活动对话】
	 * 
	 * 【$derived 的作用】
	 * 当 conversations 或 activeConversationId 变化时
	 * 自动重新计算 activeConversation
	 * 
	 * 【find() 方法】
	 * 数组方法，返回第一个满足条件的元素
	 */
	const activeConversation = $derived(
		conversations.find((c) => c.id === activeConversationId)
	);

	/**
	 * 【派生状态：排序后的对话列表】
	 * 按更新时间倒序排列（最新的在前）
	 * 
	 * 【展开运算符 ...】
	 * [...conversations] 创建新数组，避免修改原数组
	 * 这是函数式编程的"不可变性"原则
	 */
	const sortedConversations = $derived(
		[...conversations].sort((a, b) => b.updatedAt - a.updatedAt)
	);

	/**
	 * 【从 localStorage 加载对话】
	 * 只在浏览器环境执行
	 */
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

	/**
	 * 【保存对话到 localStorage】
	 * 
	 * 【JSON.stringify()】
	 * 将 JavaScript 对象转换为 JSON 字符串
	 * localStorage 只能存储字符串
	 */
	function saveConversations(): void {
		if (browser) {
			localStorage.setItem('chatgpt-conversations', JSON.stringify(conversations));
		}
	}

	/**
	 * 【创建新对话】
	 */
	function createNewConversation(): void {
		const newConv: Conversation = {
			id: generateId(),
			title: '新对话',
			messages: [],
			createdAt: Date.now(),
			updatedAt: Date.now()
		};
		// 使用展开运算符添加新对话到列表开头
		conversations = [newConv, ...conversations];
		activeConversationId = newConv.id;
		saveConversations();
	}

	/**
	 * 【选择对话】
	 */
	function selectConversation(id: string): void {
		activeConversationId = id;
	}

	/**
	 * 【删除对话】
	 * 
	 * 【filter() 方法】
	 * 数组方法，返回满足条件（返回 true）的元素组成的新数组
	 * 这里保留 ID 不等于目标 ID 的对话
	 */
	function deleteConversation(id: string): void {
		conversations = conversations.filter((c) => c.id !== id);
		if (activeConversationId === id) {
			// 如果删除的是当前对话，选择第一个对话
			activeConversationId = conversations[0]?.id ?? '';
		}
		saveConversations();
	}

	/**
	 * 【重命名对话】
	 */
	function renameConversation(id: string, newTitle: string): void {
		const conv = conversations.find((c) => c.id === id);
		if (conv) {
			conv.title = newTitle;
			saveConversations();
		}
	}

	/**
	 * 【发送消息】
	 * 核心业务逻辑函数
	 * 
	 * 【async/await】
	 * async 函数返回 Promise
	 * await 等待异步操作完成
	 * 
	 * 【实现流程】
	 * 1. 创建用户消息并添加到对话
	 * 2. 发送请求到后端
	 * 3. 获取 sessionToken（用于流式传输）
	 * 4. 建立 SSE 连接接收流式响应
	 * 5. 创建 AI 消息并保存
	 */
	async function sendMessage(content: string): Promise<void> {
		// 验证条件
		if (!activeConversationId || !content.trim() || isLoading) return;

		const conv = conversations.find((c) => c.id === activeConversationId);
		if (!conv) return;

		// 创建用户消息
		const userMessage: Message = {
			id: generateId(),
			role: 'user',
			content: content.trim(),
			timestamp: Date.now()
		};

		// 添加用户消息到对话
		conv.messages.push(userMessage);
		
		// 如果是第一条消息，用消息内容作为对话标题
		if (conv.messages.length === 1) {
			conv.title = content.trim().substring(0, 30) + (content.length > 30 ? '...' : '');
		}
		conv.updatedAt = Date.now();
		saveConversations();
		
		// 重置状态
		error = null;
		isLoading = true;
		streamingContent = '';

		try {
			/**
			 * 【发送 POST 请求】
			 * 
			 * 【fetch API】
			 * 浏览器原生 API，用于发送网络请求
			 * 
			 * 【请求配置】
			 * - method: 'POST' - HTTP 方法
			 * - headers: 请求头
			 * - body: 请求体（JSON 字符串）
			 */
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

			// 解析响应
			const data: ChatResponse = await response.json();
			const sessionToken = data.sessionToken;
			activeConversationId = data.conversation_id;

			// 如果返回的对话 ID 在本地不存在，创建新对话
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

			// 接收流式响应
			const assistantContent = await streamResponse(sessionToken);
			
			// 创建 AI 消息
			const assistantMessage: Message = {
				id: generateId(),
				role: 'assistant',
				content: assistantContent,
				timestamp: Date.now()
			};

			// 保存 AI 消息
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
			// finally 块：无论成功或失败都会执行
			isLoading = false;
			streamingContent = '';
		}
	}

	/**
	 * 【接收流式响应】
	 * 
	 * 【什么是 SSE（Server-Sent Events）？】
	 * SSE 是一种服务器推送技术
	 * 服务器可以主动向客户端发送消息
	 * 与 WebSocket 相比，SSE 更简单，是单向的（服务器→客户端）
	 * 
	 * 【EventSource API】
	 * 浏览器原生 API，用于接收 SSE
	 * 
	 * 【工作流程】
	 * 1. 创建 EventSource 连接
	 * 2. 监听 onmessage 事件接收数据
	 * 3. 监听自定义事件（如 'done'）
	 * 4. 处理错误和关闭连接
	 */
	async function streamResponse(sessionToken: string): Promise<string> {
		return new Promise((resolve, reject) => {
			// 创建 EventSource 连接
			const eventSource = new EventSource(`${API_BASE}/chat/stream?sessionToken=${sessionToken}`);
			let fullContent = '';
			let lastChunk = '';

			// 语言检测辅助函数
			const isEnglish = (word: string) => /^[A-Za-z\s]+$/.test(word);
			const isChinese = (word: string) => /^[\u4e00-\u9fa5]+$/.test(word);

			// 监听消息事件
			eventSource.onmessage = (event) => {
				try {
					// 解析 JSON 数据
					const data = JSON.parse(event.data);
					const chunk = data.content ?? '';
					
					/**
					 * 【智能空格处理】
					 * 英文单词之间需要空格
					 * 中文不需要空格
					 */
					if (isEnglish(chunk) && lastChunk && isEnglish(lastChunk)) {
						fullContent += ' ' + chunk;
					} else {
						fullContent += chunk;
					}
					lastChunk = chunk;
					
					// 更新流式内容（触发 UI 更新）
					streamingContent = fullContent;
				} catch (e) {
					console.error('Parse SSE error:', e);
				}
			};

			// 监听自定义 'done' 事件
			eventSource.addEventListener('done', () => {
				eventSource.close();
				resolve(fullContent);
			});

			// 错误处理
			eventSource.onerror = (e) => {
				eventSource.close();
				reject(e);
			};
		});
	}

	/**
	 * 【加载历史消息】
	 */
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

	/**
	 * 【清空当前对话消息】
	 */
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

	/**
	 * 【返回公共 API】
	 * 
	 * 【getter 语法】
	 * get conversations() { return conversations; }
	 * 这是 JavaScript 的 getter 定义方式
	 * 调用时不需要括号：chatStore.conversations（不是 chatStore.conversations()）
	 * 
	 * 【为什么用 getter？】
	 * 1. 只读访问：外部不能直接修改状态
	 * 2. 访问方便：像属性一样访问
	 * 3. 可以添加逻辑：获取时可以计算或转换
	 */
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

/**
 * 【导出 Store 实例】
 * 
 * 【单例模式】
 * 这里导出的是单个实例，整个应用共享同一个状态
 * 
 * 【$ 符号约定】
 * 在 Svelte 中，$ 前缀有特殊含义
 * - $store: 自动订阅 store 的值
 * - $: 响应式语句（Svelte 4）
 * 
 * 文件名不以 $ 开头，但导入时可以用 $lib 别名
 */
export const chatStore = createChatStore();

/**
 * 【初始化】
 * 页面加载时自动从 localStorage 加载对话
 */
if (browser) {
	chatStore.loadConversations();
}