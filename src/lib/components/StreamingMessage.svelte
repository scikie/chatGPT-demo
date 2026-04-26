<!--
  ============================================================
  📚 流式消息组件 - StreamingMessage.svelte
  ============================================================
  
  【组件功能】
  显示正在接收的流式消息（打字机效果）
  当 AI 正在生成回复时，实时显示部分内容
  
  【什么是流式响应？】
  传统方式：服务器处理完所有内容后一次性返回
  流式响应：服务器边生成边返回，客户端实时显示
  
  优点：
  - 用户可以更快看到部分内容
  - 提升用户体验，减少等待感
  - 类似 ChatGPT 的打字机效果
-->

<script lang="ts">
	import type { Message } from '$lib/types';
	import MarkdownRenderer from './MarkdownRenderer.svelte';

	/*
	 * 【Props 定义】
	 * content: 当前已接收的内容（部分内容）
	 * 
	 * 【为什么不需要 role？】
	 * 这个组件专门用于显示 AI 的流式回复
	 * 所以角色固定是 'assistant'
	 */
	interface Props {
		content: string;
	}

	let { content }: Props = $props();
</script>

<!--
  【消息容器】
  与 ChatMessage 组件布局相同，但添加了 animate-pulse
  animate-pulse: 淡入淡出动画，提示正在加载中
-->
<div class="flex gap-4 px-4 py-6 bg-dark-700/50 animate-pulse">
	<!-- AI 头像 -->
	<div class="flex-shrink-0">
		<div class="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
			<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.18 5 4.05 5 7.41 0 2.38-1.19 4.47-3 5.74z"/>
			</svg>
		</div>
	</div>
	
	<!-- 消息内容 -->
	<div class="flex-1 min-w-0">
		<div class="font-semibold text-sm mb-1 text-accent">ChatGPT</div>
		
		<!--
		  【条件渲染】
		  - 有内容：显示 Markdown 渲染后的内容
		  - 无内容：显示加载动画
		  
		  【为什么会有无内容的情况？】
		  在 SSE（Server-Sent Events）连接建立后，
		  第一个数据块到达之前，可能有一段等待时间
		-->
		{#if content}
			<!--
			  【Markdown 渲染】
			  即使是部分内容，也进行 Markdown 渲染
			  这样用户可以看到格式化的内容逐渐出现
			-->
			<MarkdownRenderer content={content} />
		{:else}
			<!--
			  【加载动画】
			  三个跳动的圆点
			  animation-delay 使它们错开跳动
			-->
			<div class="flex gap-1">
				<span class="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style="animation-delay: 0ms;"></span>
				<span class="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style="animation-delay: 150ms;"></span>
				<span class="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style="animation-delay: 300ms;"></span>
			</div>
		{/if}
	</div>
</div>