/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
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
	plugins: []
};
