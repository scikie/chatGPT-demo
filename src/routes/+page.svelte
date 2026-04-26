<!--
  ============================================================
  📚 主页面组件 - +page.svelte
  ============================================================
  
  【这是应用程序的主页面】
  在 SvelteKit 中，src/routes/+page.svelte 对应根路径 "/" 的页面
  这个组件实现了聊天界面的核心功能：
  - 显示消息列表
  - 自动滚动到最新消息
  - 显示加载状态和错误信息
  
  【Svelte 单文件组件结构】
  每个 .svelte 文件可包含三部分：
  1. <script> - JavaScript/TypeScript 逻辑
  2. <style> - 组件私有样式（可选）
  3. 模板 - HTML 结构
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { chatStore } from '$lib/stores/chat.svelte';
	import ChatMessage from '$lib/components/ChatMessage.svelte';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import StreamingMessage from '$lib/components/StreamingMessage.svelte';

	/*
	 * 【$state - Svelte 5 响应式状态】
	 * ================================
	 * $state() 是 Svelte 5 的 rune（符文），用于声明响应式状态
	 * 
	 * 【什么是响应式？】
	 * 当状态改变时，UI 自动更新。这是现代前端框架的核心特性。
	 * 
	 * 【对比其他框架】
	 * - React: const [state, setState] = useState(initial)
	 * - Vue 3: const state = ref(initial) 或 reactive({})
	 * - Svelte 4: let state = initial (编译时分析)
	 * - Svelte 5: let state = $state(initial) (运行时追踪)
	 * 
	 * 【泛型类型】
	 * HTMLDivElement | undefined 表示变量可能是 div 元素引用，也可能是 undefined
	 * | 是 TypeScript 的联合类型
	 */
	let messagesContainer: HTMLDivElement | undefined = $state();

	/*
	 * 【滚动到底部的辅助函数】
	 * 当新消息到来时，自动滚动到底部
	 */
	function scrollToBottom(): void {
		if (messagesContainer) {
			// scrollTop 是元素的滚动位置
			// scrollHeight 是元素内容的完整高度
			// 将 scrollTop 设置为 scrollHeight 就能滚动到底部
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}

	/*
	 * 【$effect - Svelte 5 副作用 Rune】
	 * ================================
	 * $effect 用于处理副作用（side effects）
	 * 当依赖的状态改变时，自动重新执行
	 * 
	 * 【类比其他框架】
	 * - React: useEffect(() => { ... }, [dependencies])
	 * - Vue 3: watchEffect(() => { ... })
	 * - Svelte 4: $: { ... } （响应式语句）
	 * 
	 * 【自动追踪依赖】
	 * $effect 会自动追踪内部使用的响应式状态
	 * 当 chatStore.activeConversation?.messages 改变时，这个 effect 会重新执行
	 * 
	 * 【可选链操作符 ?.】
	 * 如果 activeConversation 是 null/undefined，表达式返回 undefined 而不报错
	 * 这是 ES2020 引入的语法
	 */
	$effect(() => {
		// 当消息列表变化时，滚动到底部
		if (chatStore.activeConversation?.messages) {
			scrollToBottom();
		}
	});

	/*
	 * 【另一个 $effect】
	 * 监听流式内容的变化（打字机效果）
	 */
	$effect(() => {
		if (chatStore.streamingContent) {
			scrollToBottom();
		}
	});

	/*
	 * 【onMount 生命周期】
	 * 组件挂载后执行初始化逻辑
	 */
	onMount(() => {
		// 如果没有活动对话且没有任何对话，创建新对话
		if (!chatStore.activeConversationId && chatStore.conversations.length === 0) {
			chatStore.createNewConversation();
		} 
		// 如果有对话但没有选中，选中第一个
		else if (!chatStore.activeConversationId && chatStore.conversations.length > 0) {
			chatStore.selectConversation(chatStore.conversations[0].id);
		}
		scrollToBottom();
	});

	/*
	 * 【清空当前对话】
	 * 这是一个事件处理函数，由用户点击触发
	 */
	function handleClearChat(): void {
		chatStore.clearMessages();
	}
</script>

<!--
  【页面布局】
  使用 flex 垂直排列：
  - header: 标题栏
  - div: 消息列表（可滚动）
  - ChatInput: 输入框
-->
<div class="flex-1 flex flex-col overflow-hidden">
	<!--
	  【头部标题栏】
	  - flex items-center: 水平居中
	  - justify-between: 两端对齐
	  - px-4 py-3: 内边距
	  - border-b: 底部边框
	-->
	<header class="flex items-center justify-between px-4 py-3 border-b border-dark-700 bg-dark-800">
		<h1 class="text-lg font-semibold text-dark-100">
			{chatStore.activeConversation?.title ?? '新对话'}
		</h1>
		<!--
		  【条件渲染 #if】
		  Svelte 使用 {#if condition} ... {/if} 进行条件渲染
		  类似于 React 的 {condition && <div>...</div>}
		  
		  【可选链 + 空值合并】
		  - ?.messages?.length 安全访问嵌套属性
		  - 只有当消息数组存在且有内容时才显示清空按钮
		-->
		{#if chatStore.activeConversation?.messages.length}
			<button
				onclick={handleClearChat}
				class="flex items-center gap-2 px-3 py-1.5 text-sm text-dark-400 hover:text-dark-100 hover:bg-dark-700 rounded-lg transition-colors"
			>
				<!-- SVG 图标：垃圾桶 -->
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
				</svg>
				清空对话
			</button>
		{/if}
	</header>

	<!--
	  【消息容器】
	  - bind:this={messagesContainer}: 将 DOM 元素绑定到变量
	    这样可以在 JS 中操作这个 DOM 元素（如滚动）
	  
	  【bind:this 语法】
	  Svelte 的双向绑定语法，将 DOM 引用保存到变量
	  类似于 React 的 useRef + ref={variable}
	  
	  - flex-1: 占据剩余空间
	  - overflow-y-auto: 垂直方向超出时显示滚动条
	-->
	<div bind:this={messagesContainer} class="flex-1 overflow-y-auto">
		<!--
		  【条件判断 #if / :else if / :else】
		  Svelte 支持完整的条件分支
		  
		  这里判断是否有消息：
		  - 有消息：显示消息列表
		  - 无消息：显示欢迎界面
		-->
		{#if chatStore.activeConversation?.messages.length}
			<!--
			  【列表渲染 #each】
			  Svelte 使用 {#each array as item (key)} ... {/each}
			  类似于 React 的 array.map(item => ...)
			  
			  【key 的重要性】
			  (message.id) 是列表项的唯一标识
			  当列表更新时，Svelte 使用 key 来高效地更新 DOM
			  类似于 React 的 key prop
			  
			  【为什么需要 key？】
			  - 帮助框架识别哪些元素变化了
			  - 提高渲染性能
			  - 保持组件状态正确
			-->
			{#each chatStore.activeConversation.messages as message (message.id)}
				<!--
				  【组件属性传递】
				  {message} 是 {message={message}} 的简写
				  当属性名和变量名相同时可以简写
				-->
				<ChatMessage {message} />
			{/each}
			
			<!--
			  【流式消息或加载状态】
			  当 AI 正在回复时，显示流式内容或加载动画
			-->
			{#if chatStore.isLoading && chatStore.streamingContent}
				<!--
				  正在接收流式响应：显示打字机效果
				  streamingContent 是已经接收到的部分内容
				-->
				<StreamingMessage content={chatStore.streamingContent} />
			{:else if chatStore.isLoading}
				<!--
				  正在等待响应：显示加载动画
				  三个跳动的圆点动画
				-->
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
						<!--
						  【CSS 动画延迟】
						  style="animation-delay: Xms;" 使三个圆点错开跳动
						  animate-bounce 是 Tailwind 内置的跳动动画
						-->
						<div class="flex gap-1">
							<span class="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style="animation-delay: 0ms;"></span>
							<span class="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style="animation-delay: 150ms;"></span>
							<span class="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style="animation-delay: 300ms;"></span>
						</div>
					</div>
				</div>
			{/if}
		{:else}
			<!--
			  【欢迎界面】
			  当没有消息时显示
			  - flex-1: 填满剩余空间
			  - flex flex-col items-center justify-center: 垂直水平居中
			-->
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

	<!--
	  【错误提示】
	  当发生错误时显示错误信息
	-->
	{#if chatStore.error}
		<div class="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
			<p class="text-red-400 text-sm text-center">{chatStore.error}</p>
		</div>
	{/if}

	<!--
	  【输入框组件】
	  固定在底部，用于用户输入消息
	-->
	<ChatInput />
</div>