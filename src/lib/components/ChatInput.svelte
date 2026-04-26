<!--
  ============================================================
  📚 聊天输入组件 - ChatInput.svelte
  ============================================================
  
  【组件功能】
  这个组件实现了用户输入消息的核心功能：
  - 自适应高度的文本框
  - 中文输入法支持
  - 发送消息
  
  【技术亮点】
  1. 自动调整高度的 textarea
  2. 处理中文输入法（IME）的特殊情况
  3. 响应式设计
-->

<script lang="ts">
	import { chatStore } from '$lib/stores/chat.svelte';

	/*
	 * 【组件状态】
	 * - inputValue: 文本框的内容
	 * - textareaRef: 文本框的 DOM 引用
	 * - isComposing: 是否正在进行中文输入
	 * 
	 * 【为什么需要 isComposing？】
	 * 中文输入法（IME）在输入过程中会触发 keydown 事件
	 * 如果不做处理，用户输入拼音时就会发送消息
	 * 
	 * 【IME 工作流程】
	 * 1. 用户输入拼音：触发 compositionstart
	 * 2. 用户选择汉字：触发 compositionend
	 * 3. 期间按 Enter 不应发送消息
	 */
	let inputValue = $state('');
	let textareaRef: HTMLTextAreaElement | undefined = $state();
	let isComposing = $state(false);

	/*
	 * 【调整文本框高度】
	 * 根据内容自动调整高度，但有最大高度限制
	 * 
	 * 【实现原理】
	 * 1. 先将高度设为 auto（重置高度）
	 * 2. 再根据 scrollHeight 设置新高度
	 * 3. Math.min 确保不超过最大高度（200px）
	 */
	function adjustHeight(): void {
		if (textareaRef) {
			textareaRef.style.height = 'auto';
			textareaRef.style.height = Math.min(textareaRef.scrollHeight, 200) + 'px';
		}
	}

	/*
	 * 【发送消息】
	 * 异步函数，处理消息发送逻辑
	 * 
	 * 【async/await】
	 * async 函数返回 Promise
	 * await 用于等待异步操作完成
	 * 
	 * 【为什么要清空 inputValue？】
	 * 在发送前保存内容，然后立即清空输入框
	 * 这样用户可以立即看到输入框已清空，体验更好
	 */
	async function handleSubmit(): Promise<void> {
		// 验证：不能为空、不能正在加载、不能正在输入中文
		if (!inputValue.trim() || chatStore.isLoading || isComposing) return;
		
		// 保存内容并清空输入框
		const content = inputValue;
		inputValue = '';
		
		// 重置文本框高度
		if (textareaRef) {
			textareaRef.style.height = 'auto';
		}
		
		// 发送消息
		await chatStore.sendMessage(content);
	}

	/*
	 * 【键盘事件处理】
	 * Enter 发送消息，Shift+Enter 换行
	 * 
	 * 【为什么不直接用 submit 事件？】
	 * 因为我们需要区分 Enter 和 Shift+Enter
	 * submit 事件无法区分
	 * 
	 * 【e.preventDefault()】
	 * 阻止默认行为（换行），改为发送消息
	 */
	function handleKeyDown(e: KeyboardEvent): void {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	}

	/*
	 * 【中文输入法事件】
	 * 
	 * 【compositionstart】
	 * 当用户开始使用输入法输入时触发
	 * 例如：用户输入拼音时
	 * 
	 * 【compositionend】
	 * 当用户完成输入法输入时触发
	 * 例如：用户选择了一个汉字后
	 */
	function handleCompositionStart(): void {
		isComposing = true;
	}

	function handleCompositionEnd(): void {
		isComposing = false;
	}
</script>

<!--
  【输入区域布局】
  - sticky bottom-0: 固定在底部（滚动时也保持可见）
  - bg-gradient-to-t: 从下到上的渐变背景
  - pt-6 pb-4 px-4: 内边距
  
  【渐变遮罩效果】
  渐变背景可以创建一个"淡出"效果
  当消息滚动时，底部有一个平滑的过渡
-->
<div class="sticky bottom-0 bg-gradient-to-t from-dark-800 via-dark-800/95 to-transparent pt-6 pb-4 px-4">
	<!-- 居中容器，限制最大宽度 -->
	<div class="max-w-3xl mx-auto">
		<!--
		  【输入框容器】
		  - focus-within: 当子元素获得焦点时应用样式
		    这是一个很实用的伪类，可以高亮整个容器
		  - ring: 聚焦时的环形光晕
		  
		  【对比传统方案】
		  传统方案需要给容器添加 class，用 JS 控制
		  focus-within 纯 CSS 实现，更优雅
		-->
		<div class="relative flex items-end bg-dark-700 rounded-xl border border-dark-600 focus-within:border-dark-500 focus-within:ring-1 focus-within:ring-dark-500 transition-all">
			<!--
			  【Textarea 组件】
			  
			  【bind:this】
			  将 DOM 元素引用保存到变量
			  这样可以在 JS 中操作这个元素
			  
			  【bind:value】
			  双向绑定：输入框内容 ↔ inputValue 状态
			  
			  【事件绑定】
			  - oninput: 输入时调整高度
			  - onkeydown: 按键处理（Enter 发送）
			  - oncompositionstart/end: 中文输入法处理
			  
			  【Tailwind 类名】
			  - flex-1: 占据剩余空间
			  - bg-transparent: 透明背景
			  - resize-none: 禁用拖拽调整大小
			  - max-h-[200px]: 最大高度（Tailwind 的任意值语法）
			  - min-h-[48px]: 最小高度
			  
			  【HTML 属性】
			  - rows="1": 初始行数
			  - disabled={chatStore.isLoading}: 加载时禁用
			  - placeholder: 占位文本
			-->
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
			
			<!--
			  【发送按钮】
			  - flex-shrink-0: 不收缩
			  - m-2: 外边距
			  
			  【禁用状态】
			  - 输入为空时禁用
			  - 正在加载时禁用
			  
			  【aria-label】
			  无障碍标签，屏幕阅读器会读取
			  这是 Web 无障碍（A11y）的最佳实践
			-->
			<button
				onclick={handleSubmit}
				disabled={!inputValue.trim() || chatStore.isLoading}
				class="flex-shrink-0 m-2 p-2 rounded-lg bg-accent hover:bg-accent-light disabled:bg-dark-600 disabled:cursor-not-allowed transition-colors"
				aria-label="发送"
			>
				<!--
				  【条件渲染图标】
				  加载中：显示旋转动画
				  否则：显示发送箭头
				  
				  【animate-spin】
				  Tailwind 内置的旋转动画
				  配合 SVG 使用创建 loading 效果
				-->
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
		
		<!-- 提示文字 -->
		<p class="text-center text-xs text-dark-400 mt-2">
			ChatGPT 可能会产生错误信息，请核实重要内容。
		</p>
	</div>
</div>