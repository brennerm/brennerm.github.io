const components = import.meta.glob('/src/posts/*.md');

/** @type {import('./$types').PageLoad} */
export async function load({ data }) {
	const mod = /** @type {{ default: import('svelte').Component }} */ (
		await components[`/src/posts/${data.post.slug}.md`]()
	);
	return { ...data, Content: mod.default };
}
