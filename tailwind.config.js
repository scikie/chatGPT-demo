/**
 * ============================================================
 * 📚 Tailwind CSS 配置文件 - tailwind.config.js
 * ============================================================
 * 
 * 【什么是 Tailwind CSS？】
 * Tailwind 是一个原子化 CSS 框架
 * 提供大量预定义的 CSS 类，如：
 * - flex, grid: 布局
 * - p-4, m-2: 间距
 * - bg-blue-500: 背景颜色
 * - text-lg: 文字大小
 * 
 * 【原子化 CSS 的优势】
 * 1. 不需要写 CSS 文件
 * 2. 类名直观易懂
 * 3. 代码复用性高
 * 4. 体积小（未使用的类会被清除）
 * 
 * 【JSDoc 类型注解】
 * @type {import('tailwindcss').Config}
 * 提供类型提示
 */

/** @type {import('tailwindcss').Config} */
export default {
	/**
	 * 【内容配置】
	 * 
	 * 【content 数组的作用】
	 * Tailwind 会扫描这些文件，提取使用的类名
	 * 只有被使用的类才会包含在最终的 CSS 中
	 * 
	 * 【路径解释】
	 * './src/**/*.{html,js,svelte,ts}'
	 * - ./src: 从 src 目录开始
	 * - **: 任意子目录
	 * - *: 任意文件名
	 * - .{html,js,svelte,ts}: 指定扩展名
	 * 
	 * 【Glob 模式】
	 * 这是一种文件匹配模式（通配符）
	 */
	content: ['./src/**/*.{html,js,svelte,ts}'],
	
	/**
	 * 【暗色模式配置】
	 * 
	 * 【darkMode 的值】
	 * - 'media': 根据系统偏好自动切换
	 * - 'class': 通过 CSS 类手动控制
	 * 
	 * 【为什么选择 'class'？】
	 * 'class' 模式更灵活：
	 * - 用户可以手动切换
	 * - 不依赖系统设置
	 * - 可以记住用户偏好
	 * 
	 * 【使用方式】
	 * 在 <html> 元素添加 dark 类即可启用暗色模式
	 * Tailwind 的暗色类会自动应用：
	 * <div class="bg-white dark:bg-black">
	 */
	darkMode: 'class',
	
	/**
	 * 【主题扩展】
	 * 
	 * 【extend 对象的作用】
	 * 扩展 Tailwind 默认的主题
	 * 不覆盖默认值，只是添加新值
	 */
	theme: {
		extend: {
			/**
			 * 【自定义颜色】
			 * 
			 * 【颜色命名约定】
			 * Tailwind 使用数字表示颜色深浅
			 * - 50: 最浅
			 * - 950: 最深
			 * 
			 * 【dark 色系】
			 * 自定义的深色主题颜色
			 * 用于聊天应用的暗色界面
			 * 
			 * 【accent 色系】
			 * 强调色/品牌色
			 * - DEFAULT: 默认值（使用 accent 类时）
			 * - light: 浅色版本
			 * - dark: 深色版本
			 */
			colors: {
				dark: {
					50: '#f7f7f8',
					100: '#ececf1',
					200: '#d9d9e3',
					300: '#c5c5d2',
					400: '#acacbe',
					500: '#8e8ea0',
					600: '#565869',
					700: '#40414f',
					800: '#343541',
					900: '#202123',
					950: '#0d0d0f'
				},
				accent: {
					DEFAULT: '#10a37f',
					light: '#1ab38f',
					dark: '#0d8a6b'
				}
			}
		}
	},
	
	/**
	 * 【插件配置】
	 * 
	 * 【Tailwind 插件】
	 * 常用插件：
	 * - @tailwindcss/typography: 排版样式（prose 类）
	 * - @tailwindcss/forms: 表单样式
	 * - @tailwindcss/line-clamp: 文本截断
	 * 
	 * 这里没有使用插件，所以是空数组
	 */
	plugins: []
};