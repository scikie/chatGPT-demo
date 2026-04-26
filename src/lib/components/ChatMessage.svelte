<!--
  ============================================================
  📚 消息显示组件 - ChatMessage.svelte
  ============================================================
  
  【组件功能】
  渲染单条聊天消息，区分用户消息和 AI 消息
  - 用户消息：简单文本显示
  - AI 消息：Markdown 渲染
  
  【组件设计模式】
  这是一个"展示型组件"
  - 通过 props 接收数据
  - 只负责渲染，不处理业务逻辑
-->

<script lang="ts">
	import MarkdownRenderer from './MarkdownRenderer.svelte';
	import type { Message } from '$lib/types';

	/*
	 * 【Props 定义 - Svelte 5 风格】
	 * ================================
	 * 
	 * 【interface Props】
	 * 定义组件接收的 props 类型
	 * 这是 TypeScript 的接口定义
	 * 
	 * 【对比 Svelte 4】
	 * Svelte 4 使用 export let 声明 props：
	 *   export let message: Message;
	 * 
	 * Svelte 5 使用 $props() rune：
	 *   let { message }: Props = $props();
	 * 
	 * 【Svelte 5 的优势】
	 * 1. 类型更明确
	 * 2. 支持默认值、解构
	 * 3. 可以定义可选属性
	 * 
	 * 示例：
	 * interface Props {
	 *   message: Message;      // 必需
	 *   title?: string;        // 可选
	 *   count: number = 0;     // 带默认值
	 * }
	 */
	interface Props {
		message: Message;
	}

	/*
	 * 【解构 Props】
	 * 从 $props() 返回的对象中解构出 message
	 */
	let { message }: Props = $props();
	
	/*
	 * 【$derived - 派生状态】
	 * ================================
	 * $derived 用于声明派生状态（从其他状态计算得出）
	 * 
	 * 【什么是派生状态？】
	 * 当一个值依赖于其他响应式状态时，使用 $derived
	 * 当依赖的状态变化时，自动重新计算
	 * 
	 * 【对比其他框架】
	 * - React: useMemo(() => message.role === 'user', [message.role])
	 * - Vue 3: computed(() => message.role === 'user')
	 * - Svelte 4: $: isUser = message.role === 'user'
	 * - Svelte 5: const isUser = $derived(message.role === 'user')
	 * 
	 * 【性能优势】
	 * 派生状态会被缓存，只有依赖变化时才重新计算
	 * 避免在模板中重复计算
	 */
	const isUser = $derived(message.role === 'user');
</script>

<!--
  【消息容器】
  使用动态类名区分用户和 AI 消息的背景色：
  - 用户消息：透明背景
  - AI 消息：半透明背景
  
  【动态类名语法】
  class="... {condition ? 'class-true' : 'class-false'}"
  这是 Svelte 的模板字符串语法
  
  【Tailwind 类名】
  - flex gap-4: 弹性盒子，间距 4 单位
  - px-4 py-6: 内边距
-->
<div class="flex gap-4 px-4 py-6 {isUser ? 'bg-transparent' : 'bg-dark-700/50'}">
	<!-- 头像区域 -->
	<div class="flex-shrink-0">
		<!--
		  【条件渲染头像】
		  根据消息角色显示不同头像
		-->
		{#if isUser}
			<!-- 用户头像：人形图标，深色背景 -->
			<div class="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center">
				<svg class="w-5 h-5 text-dark-300" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
				</svg>
			</div>
		{:else}
			<!-- AI 头像：地球图标，主题色背景 -->
			<div class="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
				<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.18 5 4.05 5 7.41 0 2.38-1.19 4.47-3 5.74z"/>
				</svg>
			</div>
		{/if}
	</div>
	
	<!--
	  【消息内容区域】
	  - flex-1: 占据剩余空间
	  - min-w-0: 最小宽度为 0（防止内容溢出）
	    这是 Flexbox 的一个技巧：子元素默认 min-width: auto
	    设置为 0 可以让内容正确换行和截断
	-->
	<div class="flex-1 min-w-0">
		<!-- 发送者名称 -->
		<div class="font-semibold text-sm mb-1 {isUser ? 'text-dark-300' : 'text-accent'}">
			{isUser ? '你' : 'ChatGPT'}
		</div>
		
		<!-- 消息内容 -->
		<div class="text-dark-100 leading-relaxed">
			{#if isUser}
				<!--
				  【用户消息：纯文本】
				  - whitespace-pre-wrap: 保留空格和换行
				    pre: 保留空白字符
				    wrap: 允许换行
				  
				  【为什么用 pre-wrap？】
				  用户输入的换行需要被保留
				  同时又要允许自动换行（防止单行过长）
				-->
				<p class="whitespace-pre-wrap">{message.content}</p>
			{:else}
				<!--
				  【AI 消息：Markdown 渲染】
				  AI 的回复可能包含：
				  - 代码块
				  - 列表
				  - 标题
				  - 链接等
				  
				  使用 MarkdownRenderer 组件处理
				-->
				<MarkdownRenderer content={message.content} />
			{/if}
		</div>
	</div>
</div>