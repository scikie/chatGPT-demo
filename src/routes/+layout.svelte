<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { themeStore } from '$lib/stores/theme.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	onMount(() => {
		themeStore.init();
	});
</script>

<div class="flex h-screen overflow-hidden">
	<Sidebar />
	<main class="flex-1 flex flex-col overflow-hidden">
		{@render children()}
	</main>
</div>