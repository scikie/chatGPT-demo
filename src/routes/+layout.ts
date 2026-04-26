import { themeStore } from '$lib/stores/theme.svelte';
import '../app.css';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = () => {
	return {
		theme: themeStore.theme
	};
};

export const prerender = true;