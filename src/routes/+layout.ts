/**
 * ============================================================
 * 📚 布局数据加载 - +layout.ts
 * ============================================================
 * 
 * 【什么是 load 函数？】
 * 在 SvelteKit 中，+layout.ts 和 +page.ts 的 load 函数
 * 用于在渲染前加载数据
 * 
 * 【执行时机】
 * - 服务端渲染（SSR）时：在服务器执行
 * - 客户端导航时：在浏览器执行
 * 
 * 【文件命名规则】
 * - +layout.svelte: 布局组件（UI）
 * - +layout.ts: 布局数据加载函数
 * - +page.svelte: 页面组件（UI）
 * - +page.ts: 页面数据加载函数
 */

import { themeStore } from '$lib/stores/theme.svelte';
import '../app.css';

/**
 * 【类型导入】
 * LayoutLoad 是 SvelteKit 生成的类型
 * 定义了 load 函数的参数和返回值类型
 * 
 * 【$types 目录】
 * 这是 SvelteKit 自动生成的类型定义目录
 * 包含所有路由的类型定义
 */
import type { LayoutLoad } from './$types';

/**
 * 【导出 load 函数】
 * 
 * 【函数签名】
 * export const load: LayoutLoad = (event) => { ... }
 * 
 * 【event 参数】
 * load 函数接收一个 event 对象，包含：
 * - url: 当前 URL
 * - params: 路由参数
 * - cookies: Cookie 操作
 * - fetch: 增强的 fetch 函数
 * - parent(): 获取父布局的数据
 * 
 * 【返回值】
 * 返回的对象会作为 props 传递给 +layout.svelte
 */
export const load: LayoutLoad = () => {
	/**
	 * 【返回数据】
	 * 这里返回当前主题，让布局组件可以访问
	 * 
	 * 【数据流向】
	 * +layout.ts (load 函数) 
	 *    ↓ 返回 data
	 * +layout.svelte (接收 $props().data)
	 */
	return {
		theme: themeStore.theme
	};
};

/**
 * 【预渲染配置】
 * 
 * 【什么是预渲染？】
 * 在构建时生成静态 HTML，无需服务器渲染
 * 适合内容不经常变化的页面
 * 
 * 【prerender 的值】
 * - true: 强制预渲染
 * - false: 不预渲染（默认）
 * - 'auto': SvelteKit 自动决定
 * 
 * 【什么时候用预渲染？】
 * - 博客、文档等静态内容
 * - 不依赖用户认证的页面
 * - SEO 要求高的页面
 * 
 * 【什么时候不用？】
 * - 依赖用户登录状态的页面
 * - 有实时数据的页面
 * - 使用服务器功能的页面
 */
export const prerender = true;
