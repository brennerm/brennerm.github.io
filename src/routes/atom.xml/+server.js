import { render } from 'svelte/server';
import { getPostComponent, posts } from '#lib/posts.js';
import { site } from '#lib/site.js';

export const prerender = true;

/** @param {string} s */
const xml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function GET() {
	const entries = posts.map((post) => {
		const { body } = render(/** @type {import('svelte').Component} */ (getPostComponent(post.slug)));
		// Entry ids match the ones Jekyll generated, so feed readers don't show old posts as new.
		return `
	<entry>
		<title>${xml(post.title)}</title>
		<link href="${site.url}${post.url}"/>
		<updated>${post.date}T00:00:00+00:00</updated>
		<id>${site.url}/${post.category}/${post.slug}</id>
		<content type="html">${xml(body.replace(/<!--[\s\S]*?-->/g, ''))}</content>
	</entry>`;
	});

	const body = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
	<title>${xml(site.name)}</title>
	<link href="${site.url}/atom.xml" rel="self"/>
	<link href="${site.url}/"/>
	<updated>${new Date().toISOString().replace(/\.\d+Z$/, '+00:00')}</updated>
	<id>${site.url}</id>
	<author>
		<name>${xml(site.name)}</name>
	</author>
${entries.join('\n')}
</feed>
`;
	return new Response(body, { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' } });
}
