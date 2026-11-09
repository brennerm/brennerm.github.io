import { posts } from '#lib/posts.js';

/** @type {import('./$types').PageServerLoad} */
export function load() {
	return { posts };
}
