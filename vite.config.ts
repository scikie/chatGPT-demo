/**
 * ============================================================
 * 📚 Vite 构建配置 - vite.config.ts
 * ============================================================
 * 
 * 【什么是 Vite？】
 * Vite 是新一代前端构建工具
 * 特点：
 * - 开发服务器启动快（ESM）
 * - 热更新快（HMR）
 * - 生产构建优化（Rollup）
 * 
 * 【为什么 SvelteKit 使用 Vite？】
 * SvelteKit 底层使用 Vite 作为构建工具
 * 提供现代化的开发体验
 */

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

/**
 * 【导出配置】
 * 
 * 【defineConfig 函数】
 * Vite 提供的配置定义函数
 * 提供类型提示和自动补全
 */
export default defineConfig({
	/**
	 * 【插件配置】
	 * 
	 * 【sveltekit 插件】
	 * SvelteKit 的 Vite 插件
	 * 功能：
	 * - 编译 Svelte 组件
	 * - 处理 SvelteKit 路由
	 * - 开发服务器集成
	 * 
	 * 【插件顺序】
	 * 插件按数组顺序执行
	 * sveltekit 应该放在第一位
	 */
	plugins: [sveltekit()]
});