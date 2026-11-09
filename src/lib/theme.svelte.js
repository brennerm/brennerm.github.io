import { browser } from '$app/env';

/** Current colour scheme. A choice made with the toggle is remembered; otherwise the OS setting wins. */
export const theme = $state({ dark: false });

if (browser) {
	const media = matchMedia('(prefers-color-scheme: dark)');
	/** @returns {string | null} */
	const stored = () => {
		try {
			return localStorage.getItem('theme');
		} catch {
			return null;
		}
	};
	theme.dark = document.documentElement.getAttribute('data-theme') === 'dark';
	media.addEventListener('change', (e) => {
		if (!stored()) apply(e.matches);
	});
}

/** @param {boolean} dark */
function apply(dark) {
	theme.dark = dark;
	document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
}

export function toggleTheme() {
	apply(!theme.dark);
	try {
		localStorage.setItem('theme', theme.dark ? 'dark' : 'light');
	} catch {
		// storage unavailable: the choice just won't persist
	}
}
