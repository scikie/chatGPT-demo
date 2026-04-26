/**
 * ============================================================
 * 📚 主题状态管理 - theme.svelte.ts
 * ============================================================
 * 
 * 【组件功能】
 * 管理应用程序的主题（明/暗模式）
 * 
 * 【功能特点】
 * 1. 从 localStorage 读取用户偏好
 * 2. 检测系统主题偏好
 * 3. 提供 toggle 方法切换主题
 */

import { browser } from '$app/environment';

/**
 * 【创建主题 Store】
 * 
 * 【设计模式：单例 + 工厂函数】
 * 与 chatStore 类似，使用工厂函数创建单例
 */
function createThemeStore() {
	/**
	 * 【主题状态】
	 * 类型为 'light' | 'dark'
	 * 使用 TypeScript 的联合类型（Union Type）限制取值范围
	 */
	let theme = $state<'light' | 'dark'>('dark');

	/**
	 * 【初始化主题】
	 * 
	 * 【实现逻辑】
	 * 1. 尝试从 localStorage 读取用户保存的主题
	 * 2. 如果没有保存，检测系统偏好
	 * 3. 应用主题
	 */
	function init(): void {
		if (browser) {
			/**
			 * 【localStorage API】
			 * 浏览器本地存储，数据持久化保存
			 * - setItem(key, value): 存储数据
			 * - getItem(key): 读取数据
			 * - removeItem(key): 删除数据
			 * 
			 * 【注意】
			 * localStorage 只能存储字符串
			 * 存储对象时需要 JSON.stringify()
			 * 读取时需要 JSON.parse()
			 */
			const saved = localStorage.getItem('chatgpt-theme');
			if (saved === 'light' || saved === 'dark') {
				theme = saved;
			} else {
				/**
				 * 【媒体查询：prefers-color-scheme】
				 * 检测操作系统设置的主题偏好
				 * window.matchMedia() 返回 MediaQueryList 对象
				 * 
				 * 【matches 属性】
				 * 如果媒体查询匹配，返回 true
				 * 
				 * 【常见媒体查询】
				 * - prefers-color-scheme: light/dark - 主题偏好
				 * - prefers-reduced-motion: reduce - 减少动画偏好
				 * - prefers-contrast: high - 高对比度偏好
				 */
			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
					theme = 'dark';
				}
			}
			applyTheme();
		}
	}

	/**
	 * 【切换主题】
	 */
	function toggle(): void {
		/**
		 * 【三元运算符】
		 * condition ? valueIfTrue : valueIfFalse
		 * 简洁的条件表达式
		 */
		theme = theme === 'dark' ? 'light' : 'dark';
		
		// 保存用户偏好
		if (browser) {
			localStorage.setItem('chatgpt-theme', theme);
		}
		
		// 应用主题
		applyTheme();
	}

	/**
	 * 【应用主题到 DOM】
	 * 
	 * 【Tailwind 的暗色模式实现】
	 * Tailwind 通过在 <html> 元素添加 dark 类实现暗色模式
	 * 
	 * 【classList API】
	 * - add(class): 添加类
	 * - remove(class): 移除类
	 * - toggle(class, force): 切换类
	 *   - force: true 强制添加
	 *   - force: false 强制移除
	 * 
	 * 【document.documentElement】
	 * 返回文档的根元素，即 <html> 元素
	 */
	function applyTheme(): void {
		if (browser) {
			// 当 theme === 'dark' 时，添加 dark 类
			// 当 theme === 'light' 时，移除 dark 类
			document.documentElement.classList.toggle('dark', theme === 'dark');
		}
	}

	/**
	 * 【返回公共 API】
	 * 
	 * 【为什么只有 get 没有 set？】
	 * theme 的修改只能通过 toggle() 方法
	 * 这样可以在修改时执行额外逻辑（保存、应用）
	 */
	return {
		get theme() { return theme; },
		init,
		toggle
	};
}

/**
 * 【导出单例】
 */
export const themeStore = createThemeStore();
