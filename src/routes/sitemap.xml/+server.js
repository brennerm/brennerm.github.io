import { posts } from '#lib/posts.js';
import { site } from '#lib/site.js';

export const prerender = true;

export function GET() {
	const urls = posts.map(
		(post) => `
	<url>
		<loc>${site.url}${post.url}</loc>
		<lastmod>${post.date}T00:00:00+00:00</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.5</priority>
	</url>`
	);
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}
</urlset>
`;
	return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
