import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';
import { highlight, rehypeKramdownHeadings } from './src/lib/markdown.js';

export default defineConfig({
	plugins: [
		sveltekit({
			extensions: ['.svelte', '.md'],
			preprocess: [
				mdsvex({
					extensions: ['.md'],
					smartypants: true,
					highlight: { highlighter: highlight },
					rehypePlugins: [rehypeKramdownHeadings]
				})
			],
			compilerOptions: {
				// Force runes mode for the project, except for libraries and markdown posts.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') || filename.endsWith('.md')
						? undefined
						: true
			},
			adapter: adapter({ strict: true }),
			prerender: {
				handleHttpError: ({ path, message }) => {
					// Static files that are not part of the SvelteKit app (e.g. the reveal.js slides)
					if (path.startsWith('/slides/')) return;
					throw new Error(message);
				}
			}
		})
	]
});
