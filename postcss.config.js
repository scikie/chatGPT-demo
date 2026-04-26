/**
 * ============================================================
 * 📚 PostCSS 配置文件 - postcss.config.js
 * ============================================================
 * 
 * 【什么是 PostCSS？】
 * PostCSS 是一个 CSS 预处理/后处理工具
 * 可以通过插件转换 CSS 代码
 * 
 * 【工作流程】
 * CSS 源文件 → PostCSS 处理 → 最终 CSS
 * 
 * 【为什么需要 PostCSS？】
 * Tailwind CSS 需要处理：
 * 1. 解析 Tailwind 类名
 * 2. 生成对应的 CSS 规则
 * 3. 添加浏览器前缀
 */

export default {
	/**
	 * 【插件配置】
	 * 
	 * 插件按对象属性顺序执行
	 */
	plugins: {
		/**
		 * 【Tailwind CSS 插件】
		 * 
		 * 功能：
		 * - 扫描 HTML/Svelte 文件中的类名
		 * - 生成对应的 CSS 规则
		 * - 处理 @apply 等指令
		 * 
		 * 配置为空对象 {} 表示使用默认配置
		 * 配置文件在 tailwind.config.js
		 */
		tailwindcss: {},
		
		/**
		 * 【Autoprefixer 插件】
		 * 
		 * 功能：
		 * - 自动添加 CSS 浏览器前缀
		 * - 根据 browserslist 配置确定目标浏览器
		 * 
		 * 【示例】
		 * 输入:
		 *   display: flex;
		 * 
		 * 输出:
		 *   display: -webkit-box;
		 *   display: -webkit-flex;
		 *   display: -ms-flexbox;
		 *   display: flex;
		 */
		autoprefixer: {}
	}
};