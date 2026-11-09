import { posts, tags } from '#lib/posts.js';

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	return tags.map((tag) => ({ tag }));
}

/** @type {import('./$types').PageServerLoad} */
export function load({ params }) {
	return { tag: params.tag, posts: posts.filter((p) => p.tags.includes(params.tag)) };
}
