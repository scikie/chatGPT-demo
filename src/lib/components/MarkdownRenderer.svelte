<!--
  ============================================================
  📚 Markdown 渲染组件 - MarkdownRenderer.svelte
  ============================================================
  
  【组件功能】
  将 Markdown 文本转换为 HTML 并渲染
  支持代码高亮
  
  【使用的库】
  - marked: Markdown 解析器
  - highlight.js: 代码语法高亮
  - marked-highlight: marked 的代码高亮插件
  
  【什么是 Markdown？】
  Markdown 是一种轻量级标记语言
  可以用简单的语法表示：
  - 标题（# 标题）
  - 列表（- 列表项）
  - 代码块（```代码```）
  - 链接、图片、表格等
-->

<script lang="ts">
	/*
	 * 【导入第三方库】
	 * 在 Svelte 中导入 npm 包的方式与普通 JS 项目相同
	 */
	import { marked } from 'marked';
	import { markedHighlight } from 'marked-highlight';
	import hljs from 'highlight.js';
	
	/*
	 * 【导入样式】
	 * 导入 highlight.js 的主题样式
	 * github-dark 是一个暗色主题，适合深色背景
	 */
	import 'highlight.js/styles/github-dark.css';

	/*
	 * 【配置 marked】
	 * 使用 markedHighlight 插件，为代码块添加语法高亮
	 * 
	 * 【marked.use()】
	 * marked 是可扩展的，可以通过 use() 方法添加插件
	 * 
	 * 【插件工作原理】
	 * 当 marked 遇到代码块时：
	 * 1. 调用 highlight 函数
	 * 2. 传入代码内容和语言标识
	 * 3. highlight.js 为代码添加语法高亮
	 * 4. 返回带高亮的 HTML
	 */
	marked.use(
		markedHighlight({
			langPrefix: 'hljs language-',
			highlight(code, lang) {
				/*
				 * 【语言检测】
				 * hljs.getLanguage(lang) 检查是否支持该语言
				 * 如果不支持，使用 plaintext（纯文本）
				 */
				const language = hljs.getLanguage(lang) ? lang : 'plaintext';
				return hljs.highlight(code, { language }).value;
			}
		})
	);

	/*
	 * 【Props 定义】
	 */
	interface Props {
		content: string;
	}

	let { content }: Props = $props();

	/*
	 * 【派生状态：解析后的 HTML】
	 * 
	 * 【marked.parse()】
	 * 将 Markdown 字符串转换为 HTML 字符串
	 * 
	 * 【配置选项】
	 * - breaks: true - 将换行符转换为 <br>
	 * - gfm: true - 启用 GitHub Flavored Markdown
	 * 
	 * 【GFM 是什么？】
	 * GitHub Flavored Markdown，GitHub 扩展的 Markdown 语法
	 * 支持：
	 * - 删除线（~~文本~~）
	 * - 任务列表（- [ ] 任务）
	 * - 表格
	 * - 自动链接
	 * 
	 * 【类型断言 as string】
	 * marked.parse() 的返回类型是 string | Promise<string>
	 * 因为我们没有使用异步模式，所以断言为 string
	 */
	let htmlContent = $derived(
		marked.parse(content || '', { breaks: true, gfm: true }) as string
	);
</script>

<!--
  【渲染容器】
  - prose: Tailwind Typography 插件的类
    提供美观的默认排版样式
  - prose-invert: 反色主题（适合深色背景）
  - max-w-none: 移除最大宽度限制
  
  【Tailwind Typography】
  这是一个 Tailwind 插件，提供 prose 类
  可以让普通 HTML 内容拥有美观的排版
  无需为每个元素单独设置样式
  
  【自定义样式类】
  prose-p:my-2 - 段落的外边距
  prose-headings:my-3 - 标题的外边距
  prose-pre:my-2 - 代码块的外边距
-->
<div class="prose prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-pre:my-2">
	<!--
	  {@html ...} - 渲染原始 HTML
	  ================================
	  【重要安全提示】
	  {@html} 会直接渲染 HTML 字符串，不进行转义
	  如果 HTML 来自用户输入，可能导致 XSS 攻击！
	  
	  【XSS 攻击是什么？】
	  XSS（跨站脚本攻击）
	  攻击者注入恶意脚本，如：<script>alert('hacked')</script>
	  
	  【为什么这里可以安全使用？】
	  1. content 来自 AI 的回复，不是用户直接输入
	  2. marked 会过滤掉 <script> 等危险标签
	  3. 但生产环境建议使用 DOMPurify 等库进一步净化
	  
	  【对比 React】
	  React: <div dangerouslySetInnerHTML={{__html: htmlContent}} />
	  Vue: <div v-html="htmlContent"></div>
	  Svelte: <div>{@html htmlContent}</div>
	-->
	{@html htmlContent}
</div>

<!--
  【组件私有样式】
  Svelte 的 <style> 标签内的样式默认是组件私有的
  通过哈希类名实现作用域隔离
  
  【:global() 语法】
  Svelte 默认会重写类名以实现作用域隔离
  但对于动态生成的 HTML（如 {@html}），无法预知类名
  所以需要 :global() 来选择全局元素
  
  示例：
  .prose :global(pre) 表示 .prose 内的所有 pre 元素
  不受作用域限制
  
  【为什么用 :global？】
  Markdown 渲染后的 HTML 元素是动态生成的
  无法在编译时添加哈希类名
  所以需要全局选择器
-->
<style>
	/*
	 * 【代码块样式】
	 * pre: 代码块容器
	 * code: 代码内容
	 */
	.prose :global(pre) {
		@apply bg-dark-900 rounded-lg p-4 overflow-x-auto my-2;
	}

	/*
	 * 【行内代码样式】
	 * 单反引号 `代码` 包裹的代码
	 */
	.prose :global(code) {
		@apply bg-dark-700 px-1.5 py-0.5 rounded text-sm font-mono;
	}

	/*
	 * 【代码块内的代码样式】
	 * 覆盖行内代码样式，避免双重背景
	 */
	.prose :global(pre code) {
		@apply bg-transparent p-0;
	}

	/*
	 * 【段落样式】
	 */
	.prose :global(p) {
		@apply leading-relaxed;
	}

	/*
	 * 【列表样式】
	 */
	.prose :global(ul),
	.prose :global(ol) {
		@apply my-2 pl-6;
	}

	.prose :global(li) {
		@apply my-1;
	}

	/*
	 * 【链接样式】
	 */
	.prose :global(a) {
		@apply text-accent hover:underline;
	}

	/*
	 * 【引用块样式】
	 */
	.prose :global(blockquote) {
		@apply border-l-4 border-dark-500 pl-4 my-2;
	}
</style>