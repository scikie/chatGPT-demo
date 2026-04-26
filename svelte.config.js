/**
 * ============================================================
 * 📚 SvelteKit 配置文件 - svelte.config.js
 * ============================================================
 * 
 * 【什么是 svelte.config.js？】
 * 这是 SvelteKit 的配置文件，用于配置：
 * - 编译选项
 * - SvelteKit 适配器
 * - 预渲染选项
 * 
 * 【为什么是 .js 不是 .ts？】
 * SvelteKit 配置文件使用 CommonJS 格式
 * 但也可以使用 ESM 格式的 .ts 文件
 */

/**
 * 【导入适配器】
 * 
 * 【什么是适配器？】
 * SvelteKit 构建时需要适配器来输出针对不同平台的代码
 * - adapter-auto: 自动检测部署环境
 * - adapter-node: Node.js 服务器
 * - adapter-static: 纯静态网站
 * - adapter-vercel: Vercel 平台
 * - adapter-netlify: Netlify 平台
 * 
 * 【adapter-auto 的作用】
 * 自动检测常见的部署环境：
 * - Vercel
 * - Netlify
 * - Cloudflare Pages
 * - AWS Amplify
 */
import adapter from '@sveltejs/adapter-auto';

/**
 * 【类型注解】
 * @type {import('@sveltejs/kit').Config}
 * 
 * 这是 JSDoc 类型注解
 * 让编辑器能提供类型提示和检查
 */
/** @type {import('@sveltejs/kit').Config} */
const config = {
	/**
	 * 【编译器选项】
	 */
	compilerOptions: {
		/**
		 * 【启用 Runes 模式】
		 * 
		 * 【什么是 Runes？】
		 * Runes 是 Svelte 5 的响应式系统
		 * - $state: 响应式状态
		 * - $derived: 派生状态
		 * - $effect: 副作用
		 * - $props: 组件属性
		 * 
		 * 【为什么要强制启用？】
		 * Svelte 5 默认在组件中启用 Runes
		 * 但 node_modules 中的库可能不兼容
		 * 所以通过函数判断是否启用
		 * 
		 * 【配置函数解释】
		 * ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
		 * - 如果文件在 node_modules 中，返回 undefined（使用库自己的模式）
		 * - 否则返回 true（强制启用 Runes）
		 * 
		 * 【正则表达式解释】
		 * /[/\\]/ 匹配正斜杠或反斜杠
		 * 兼容 Windows 和 Unix 路径
		 */
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	
	/**
	 * 【SvelteKit 配置】
	 */
	kit: {
		/**
		 * 【适配器配置】
		 * adapter-auto 会自动选择合适的适配器
		 * 
		 * 【生产环境建议】
		 * 明确指定适配器可以：
		 * - 更好地控制构建输出
		 * - 避免自动检测的错误
		 * - 使用平台特定特性
		 */
		adapter: adapter()
	}
};

export default config;
