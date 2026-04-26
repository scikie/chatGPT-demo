<!--
  ============================================================
  📚 SvelteKit 布局文件 - +layout.svelte
  ============================================================
  
  【什么是布局文件？】
  布局文件是 SvelteKit 的特殊文件，文件名以 "+" 开头。
  它定义了应用程序的通用布局结构，所有页面都会继承这个布局。
  
  【文件命名规则】
  - +layout.svelte: 布局组件（UI结构）
  - +page.svelte: 页面组件
  - +layout.ts: 布局数据加载函数
  
  【SvelteKit 路由系统】
  SvelteKit 使用基于文件系统的路由：
  - src/routes/ 目录下的文件自动成为路由
  - +layout.svelte 的内容会包裹所有子路由
  - 这种继承关系可以嵌套（可以有子目录的布局）
-->

<script lang="ts">
	/*
	 * 【导入全局样式】
	 * 在 Svelte 中，导入的 CSS 文件会作用于整个组件及其子组件
	 * app.css 通常包含全局样式、CSS 变量等
	 */
	import '../app.css';
	
	/*
	 * 【生命周期函数：onMount】
	 * onMount 是 Svelte 的生命周期函数之一
	 * 当组件首次被挂载到 DOM 时执行（类似于 React 的 useEffect(() => {}, [])）
	 * 
	 * 【其他生命周期函数】
	 * - onDestroy: 组件销毁时执行
	 * - beforeUpdate: 组件更新前执行（Svelte 5 已弃用，改用 $effect）
	 * - afterUpdate: 组件更新后执行（Svelte 5 已弃用，改用 $effect）
	 */
	import { onMount } from 'svelte';
	
	/*
	 * 【路径别名 $lib】
	 * $lib 是 SvelteKit 的内置路径别名，指向 src/lib 目录
	 * 这样可以避免使用相对路径如 '../../../lib/stores/theme.svelte'
	 * 
	 * 【导入 Store】
	 * Store 是 Svelte 的状态管理方案，用于跨组件共享状态
	 * 这里导入主题 store，用于管理明暗模式
	 */
	import { themeStore } from '$lib/stores/theme.svelte';
	
	/*
	 * 【导入组件】
	 * Sidebar 是侧边栏组件，显示对话历史
	 */
	import Sidebar from '$lib/components/Sidebar.svelte';
	
	/*
	 * 【Snippet 类型】
	 * Snippet 是 Svelte 5 引入的新特性，用于表示插槽内容（children）
	 * 类似于 React 的 children prop，但类型更明确
	 * 
	 * 【$props() - Svelte 5 Runes】
	 * $props() 是 Svelte 5 引入的 rune（符文），用于声明组件的 props
	 * Runes 是 Svelte 5 的响应式系统核心，以 $ 符号开头
	 * 
	 * 【为什么要用 Runes？】
	 * Svelte 5 之前，响应式依赖变量赋值位置（编译时分析）
	 * Svelte 5 使用 Runes，在运行时追踪依赖，更精确、可控
	 */
	import type { Snippet } from 'svelte';

	/*
	 * 【解构 Props】
	 * 这里定义了组件接收一个 children prop，类型为 Snippet
	 * 子路由的内容会通过 children 传入
	 */
	let { children }: { children: Snippet } = $props();

	/*
	 * 【onMount 钩子】
	 * 组件挂载后初始化主题
	 * 这样可以读取 localStorage 中保存的主题偏好
	 */
	onMount(() => {
		themeStore.init();
	});
</script>

<!--
  【布局结构】
  使用 Flexbox 创建一个全屏布局：
  - 左侧：Sidebar 侧边栏
  - 右侧：main 主内容区域
  
  【Tailwind CSS 类名解释】
  - flex: display: flex (弹性盒子布局)
  - h-screen: height: 100vh (占满整个视口高度)
  - overflow-hidden: 隐藏溢出内容，防止页面滚动
  
  【组件树结构】
  Sidebar (侧边栏，固定宽度)
  └── main (主内容区域，flex-1 自动填充剩余空间)
      └── children (子路由内容，如 +page.svelte)
-->
<div class="flex h-screen overflow-hidden">
	<!-- 侧边栏组件：显示对话历史列表 -->
	<Sidebar />
	
	<!-- 
	  【主内容区域】
	  - flex-1: flex: 1 (自动填充剩余空间)
	  - flex-col: flex-direction: column (垂直排列)
	  - overflow-hidden: 隐藏溢出，子元素内部自行处理滚动
	-->
	<main class="flex-1 flex flex-col overflow-hidden">
		<!--
		  {@render ...} Svelte 5 新语法
		  ================================
		  【渲染插槽内容】
		  @render 用于渲染 Snippet 类型的内容
		  类似于 Vue 的 <slot> 或 React 的 {children}
		  
		  【Svelte 版本对比】
		  - Svelte 4: <slot /> 
		  - Svelte 5: {@render children()}
		  
		  为什么要改？
		  - Snippet 是可组合的，可以传递参数
		  - 类型安全，TypeScript 可以检查
		  
		  示例（带参数的 Snippet）：
		  {#snippet greet(name)}
		    <p>Hello, {name}!</p>
		  {/snippet}
		-->
		{@render children()}
	</main>
</div>
