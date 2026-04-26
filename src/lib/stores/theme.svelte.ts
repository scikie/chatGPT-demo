import { browser } from '$app/environment';

function createThemeStore() {
	let theme = $state<'light' | 'dark'>('dark');

	function init(): void {
		if (browser) {
			const saved = localStorage.getItem('chatgpt-theme');
			if (saved === 'light' || saved === 'dark') {
				theme = saved;
			} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				theme = 'dark';
			}
			applyTheme();
		}
	}

	function toggle(): void {
		theme = theme === 'dark' ? 'light' : 'dark';
		if (browser) {
			localStorage.setItem('chatgpt-theme', theme);
		}
		applyTheme();
	}

	function applyTheme(): void {
		if (browser) {
			document.documentElement.classList.toggle('dark', theme === 'dark');
		}
	}

	return {
		get theme() { return theme; },
		init,
		toggle
	};
}

export const themeStore = createThemeStore();
