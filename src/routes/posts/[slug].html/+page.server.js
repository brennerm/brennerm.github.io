import { error } from '@sveltejs/kit';
import { allPosts } from '#lib/posts.js';

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	return allPosts.map((p) => ({ slug: p.slug }));
}

/** @type {import('./$types').PageServerLoad} */
export function load({ params }) {
	const post = allPosts.find((p) => p.slug === params.slug);
	if (!post) error(404, 'Not found');
	return { post };
}
