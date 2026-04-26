<script lang="ts">
	import { marked } from 'marked';
	import { markedHighlight } from 'marked-highlight';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github-dark.css';

	marked.use(
		markedHighlight({
			langPrefix: 'hljs language-',
			highlight(code, lang) {
				const language = hljs.getLanguage(lang) ? lang : 'plaintext';
				return hljs.highlight(code, { language }).value;
			}
		})
	);

	interface Props {
		content: string;
	}

	let { content }: Props = $props();

	let htmlContent = $derived(
		marked.parse(content || '', { breaks: true, gfm: true }) as string
	);
</script>

<div class="prose prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-pre:my-2">
	{@html htmlContent}
</div>

<style>
	.prose :global(pre) {
		@apply bg-dark-900 rounded-lg p-4 overflow-x-auto my-2;
	}

	.prose :global(code) {
		@apply bg-dark-700 px-1.5 py-0.5 rounded text-sm font-mono;
	}

	.prose :global(pre code) {
		@apply bg-transparent p-0;
	}

	.prose :global(p) {
		@apply leading-relaxed;
	}

	.prose :global(ul),
	.prose :global(ol) {
		@apply my-2 pl-6;
	}

	.prose :global(li) {
		@apply my-1;
	}

	.prose :global(a) {
		@apply text-accent hover:underline;
	}

	.prose :global(blockquote) {
		@apply border-l-4 border-dark-500 pl-4 my-2;
	}
</style>
