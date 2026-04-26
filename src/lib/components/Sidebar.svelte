<!--
  ============================================================
  📚 侧边栏组件 - Sidebar.svelte
  ============================================================
  
  【组件功能】
  这个组件实现了聊天应用的核心导航功能：
  - 显示对话历史列表
  - 创建新对话
  - 重命名/删除对话
  - 切换主题（明/暗模式）
  
  【组件设计模式】
  这是一个"展示型组件"（Presentational Component）
  - 只负责 UI 展示和用户交互
  - 业务逻辑由 store 处理（关注点分离）
-->

<script lang="ts">
	/*
	 * 【导入 Store】
	 * 导入两个 store：
	 * - chatStore: 管理对话和消息的状态
	 * - themeStore: 管理主题（明暗模式）的状态
	 * 
	 * 【什么是 Store？】
	 * Store 是 Svelte 的跨组件状态管理方案
	 * 允许在不同组件间共享状态，避免 prop drilling
	 */
	import { chatStore } from '$lib/stores/chat.svelte';
	import { themeStore } from '$lib/stores/theme.svelte';

	/*
	 * 【组件内部状态】
	 * 这些状态只在当前组件使用，不需要跨组件共享
	 * 
	 * 【编辑状态】
	 * - editingId: 正在编辑的对话 ID，null 表示没有编辑
	 * - editTitle: 编辑框中的标题文本
	 * 
	 * 【删除确认】
	 * - confirmDelete: 需要确认删除的对话 ID，null 表示没有
	 * 
	 * 【为什么要二次确认删除？】
	 * 这是一个常见的 UX（用户体验）设计模式
	 * 防止用户误删重要数据
	 */
	let editingId = $state<string | null>(null);
	let editTitle = $state('');
	let confirmDelete = $state<string | null>(null);

	/*
	 * 【选择对话】
	 * 点击对话项时调用，将此对话设为活动对话
	 */
	function handleSelect(id: string): void {
		chatStore.selectConversation(id);
	}

	/*
	 * 【创建新对话】
	 * 点击"新对话"按钮时调用
	 * 
	 * 【实现细节】
	 * 1. 如果当前对话有消息，先保存到历史记录
	 * 2. 创建新的空对话
	 */
	function handleNewChat(): void {
		const currentConv = chatStore.activeConversation;
		if (currentConv && currentConv.messages.length > 0) {
			chatStore.saveConversations();
		}
		chatStore.createNewConversation();
	}

	/*
	 * 【删除对话】
	 * 用户确认后执行删除
	 */
	function handleDelete(id: string): void {
		chatStore.deleteConversation(id);
		confirmDelete = null;
	}

	/*
	 * 【开始编辑】
	 * 点击编辑按钮时，设置编辑状态并填充当前标题
	 */
	function startEdit(id: string, currentTitle: string): void {
		editingId = id;
		editTitle = currentTitle;
	}

	/*
	 * 【编辑时的键盘事件】
	 * 按 Enter 确认，按 Esc 取消
	 * 
	 * 【事件类型】
	 * KeyboardEvent 是 TypeScript 对键盘事件的类型定义
	 * e.key 可以获取按下的键
	 */
	function handleEditKeydown(e: KeyboardEvent): void {
		if (e.key === 'Enter') {
			// Enter: 保存修改
			if (editingId && editTitle.trim()) {
				chatStore.renameConversation(editingId, editTitle.trim());
			}
			editingId = null;
			editTitle = '';
		}
		if (e.key === 'Escape') {
			// Esc: 取消修改
			editingId = null;
			editTitle = '';
		}
	}

	/*
	 * 【输入框失焦事件】
	 * 当编辑框失去焦点时保存修改
	 * 
	 * 【注意事项】
	 * 失焦保存可能会导致意外保存，这里故意保留这个行为
	 * 某些产品可能希望在失焦时取消编辑
	 */
	function handleEditBlur(): void {
		if (editingId && editTitle.trim()) {
			chatStore.renameConversation(editingId, editTitle.trim());
		}
		editingId = null;
		editTitle = '';
	}

	/*
	 * 【对话项点击处理】
	 * 
	 * 【事件委托模式】
	 * 这里使用了事件委托：
	 * - 点击事件绑定在父元素上
	 * - 通过检查 target 判断点击的是哪个部分
	 * 
	 * 【为什么要用事件委托？】
	 * 1. 减少事件监听器数量（性能优化）
	 * 2. 动态添加的元素也能响应事件
	 * 
	 * 【MouseEvent 类型】
	 * MouseEvent 包含鼠标事件的信息，如点击位置、目标元素等
	 */
	function handleConversationClick(e: MouseEvent, id: string): void {
		// 如果正在编辑这个对话，不处理点击
		if (editingId === id) return;
		// 如果正在确认删除这个对话，不处理点击
		if (confirmDelete === id) return;
		// 如果点击的是操作按钮区域，不处理点击
		const target = e.target as HTMLElement;
		if (target.closest('.action-buttons')) return;
		// 否则选中这个对话
		handleSelect(id);
	}
</script>

<!--
  【侧边栏布局】
  使用 Flexbox 垂直排列：
  - 顶部：新建对话按钮
  - 中间：历史记录列表（可滚动）
  - 底部：主题切换按钮
  
  【Tailwind 类名解释】
  - flex flex-col: 弹性盒子，垂直方向排列
  - w-64: width: 16rem (256px)
  - h-full: height: 100%
  - bg-dark-900: 深色背景
-->
<aside class="flex flex-col w-64 h-full bg-dark-900 text-dark-100">
	<!-- 新建对话按钮 -->
	<div class="p-3">
		<button
			onclick={handleNewChat}
			class="w-full flex items-center gap-2 px-3 py-3 border border-dark-600 rounded-lg hover:bg-dark-700 transition-colors"
		>
			<!-- SVG: 加号图标 -->
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
			</svg>
			<span>新对话</span>
		</button>
	</div>

	<!--
	  【对话历史列表】
	  - flex-1: 占据剩余空间
	  - overflow-y-auto: 内容超出时显示滚动条
	-->
	<div class="flex-1 overflow-y-auto px-2">
		<div class="text-xs text-dark-400 px-2 py-2">历史记录</div>
		
		<!--
		  【列表渲染】
		  sortedConversations 是按更新时间排序的对话列表
		  
		  【关于 as const】
		  这里的 as 不是 TypeScript 的类型断言
		  在 Svelte 模板中，(conv.id) 是 key 的语法
		-->
		{#each chatStore.sortedConversations as conv (conv.id)}
			<!--
			  【对话项】
			  - group: Tailwind 的组合类，用于实现 hover 效果
			  - relative: 为绝对定位的子元素提供参照
			  - cursor-pointer: 鼠标指针样式
			  - {active ? 'bg' : 'hover:bg'}: 动态类名
			  
			  【动态类名语法】
			  class="... {condition ? 'class-if-true' : 'class-if-false'}"
			  这是 Svelte 的模板语法，可以嵌入表达式
			  
			  【事件处理】
			  onclick={(e) => handleConversationClick(e, conv.id)}
			  使用箭头函数传递参数
			  
			  【键盘可访问性】
			  onkeydown: 支持键盘操作
			  role="button": ARIA 属性，告诉屏幕阅读器这是一个按钮
			  tabindex="0": 使元素可以通过 Tab 键聚焦
			-->
			<div
				class="group relative flex items-center gap-2 px-3 py-2 my-1 rounded-lg cursor-pointer transition-colors {chatStore.activeConversationId === conv.id ? 'bg-dark-700' : 'hover:bg-dark-700/50'}"
				onclick={(e) => handleConversationClick(e, conv.id)}
				onkeydown={(e) => e.key === 'Enter' && handleSelect(conv.id)}
				role="button"
				tabindex="0"
			>
				<!-- 对话图标 -->
				<svg class="w-4 h-4 text-dark-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
				</svg>
				
				<!--
				  【编辑模式】
				  条件渲染：如果正在编辑这个对话，显示输入框；否则显示标题
				-->
				{#if editingId === conv.id}
					<!--
					  【双向绑定 bind:value】
					  bind:value={editTitle} 创建双向绑定：
					  - 输入框的值变化 → 更新 editTitle
					  - editTitle 变化 → 更新输入框的值
					  
					  【对比 React】
					  React 中需要：
					  <input 
					    value={editTitle} 
					    onChange={e => setEditTitle(e.target.value)} 
					  />
					  Svelte 的 bind: 更简洁
					  
					  【事件处理】
					  onkeydown: 键盘事件
					  onblur: 失焦事件
					  onclick={(e) => e.stopPropagation()}: 阻止事件冒泡
					    这样点击输入框不会触发父元素的点击事件
					-->
					<input
						type="text"
						bind:value={editTitle}
						onkeydown={handleEditKeydown}
						onblur={handleEditBlur}
						onclick={(e) => e.stopPropagation()}
						class="flex-1 bg-dark-600 text-sm px-1 py-0.5 rounded text-dark-100 focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				{:else}
					<!--
					  【文本截断】
					  - truncate: overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
					    当文本过长时显示省略号...
					-->
					<span class="flex-1 text-sm truncate">{conv.title}</span>
				{/if}

				<!--
				  【确认删除界面】
				  当用户点击删除按钮后，显示确认/取消按钮
				-->
				{#if confirmDelete === conv.id}
					<div class="action-buttons flex gap-1" onclick={(e) => e.stopPropagation()}>
						<!-- 确认按钮 -->
						<button
							onclick={() => handleDelete(conv.id)}
							class="p-1 text-red-400 hover:text-red-300"
							title="确认删除"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
						</button>
						<!-- 取消按钮 -->
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
					<!--
					  【悬停操作按钮】
					  - hidden: 默认隐藏
					  - group-hover:flex: 当父元素（有 group 类）被 hover 时显示
					  
					  【CSS 组合选择器】
					  这是 Tailwind 的 group 工具类特性
					  相当于 CSS:
					  .group:hover .group-hover\:flex { display: flex; }
					-->
					<div class="action-buttons hidden group-hover:flex gap-1" onclick={(e) => e.stopPropagation()}>
						<!-- 编辑按钮 -->
						<button
							onclick={() => startEdit(conv.id, conv.title)}
							class="p-1 text-dark-400 hover:text-dark-100"
							title="重命名"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.768 3.768m-3.768-3.768a2.5 2.5 0 113.536 3.536l-10.6 10.6H4v-3.536l10.6-10.6z"></path>
							</svg>
						</button>
						<!-- 删除按钮 -->
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

	<!--
	  【底部区域：主题切换】
	  - p-3: 内边距
	  - border-t: 上边框
	-->
	<div class="p-3 border-t border-dark-700">
		<button
			onclick={() => themeStore.toggle()}
			class="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-700 transition-colors"
		>
			<!--
			  【条件渲染显示不同图标】
			  根据当前主题显示太阳或月亮图标
			-->
			{#if themeStore.theme === 'dark'}
				<!-- 深色模式：显示太阳图标（点击切换到浅色） -->
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
				</svg>
				<span>浅色模式</span>
			{:else}
				<!-- 浅色模式：显示月亮图标（点击切换到深色） -->
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
				</svg>
				<span>深色模式</span>
			{/if}
		</button>
	</div>
</aside>