import { render } from 'svelte/server';

/**
 * @typedef {object} PostMeta
 * @property {string} title
 * @property {string} description
 * @property {string} date ISO date (YYYY-MM-DD)
 * @property {string} category
 * @property {string[]} tags
 * @property {boolean} [draft]
 * @property {string} [thumbnail]
 */

/**
 * @typedef {PostMeta & { slug: string, url: string, readTime: string }} Post
 */

const modules = /** @type {Record<string, { default: import('svelte').Component, metadata: PostMeta }>} */ (
	import.meta.glob('/src/posts/*.md', { eager: true })
);

/**
 * Same rule as the old readtime include: Liquid's `number_of_words` on the
 * rendered HTML, 180 words per minute, at least one minute.
 * @param {import('svelte').Component} component
 */
function readTime(component) {
	const words = render(component).body.split(/\s+/).filter(Boolean).length;
	return words < 360 ? '1 min read' : `${Math.floor(words / 180)} min read`;
}

/** @type {Post[]} */
export const allPosts = Object.entries(modules)
	.map(([path, mod]) => {
		const slug = /** @type {string} */ (path.split('/').pop()).replace(/\.md$/, '');
		const meta = mod.metadata;
		return {
			...meta,
			date: new Date(meta.date).toISOString().slice(0, 10),
			tags: meta.tags ?? [],
			slug,
			url: `/${meta.category}/${slug}.html`,
			readTime: readTime(mod.default)
		};
	})
	.sort((a, b) => b.date.localeCompare(a.date));

/** Posts shown in listings and feeds. Drafts still get a page, like on Jekyll. */
export const posts = allPosts.filter((p) => !p.draft);

/** @param {string} slug */
export function getPostComponent(slug) {
	return modules[`/src/posts/${slug}.md`]?.default;
}

export const tags = [...new Set(allPosts.flatMap((p) => p.tags))].sort();
