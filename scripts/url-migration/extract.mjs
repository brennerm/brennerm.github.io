// Shared helpers that describe a built site (the old Jekyll one or the new
// SvelteKit one) in terms of what matters for SEO and inbound links.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'node-html-parser';

/** @param {string} dir */
export function listFiles(dir) {
	/** @type {string[]} */
	const out = [];
	const walk = (/** @type {string} */ d) => {
		for (const name of readdirSync(d)) {
			const p = join(d, name);
			if (statSync(p).isDirectory()) walk(p);
			else out.push(relative(dir, p).split('\\').join('/'));
		}
	};
	walk(dir);
	return out.sort();
}

const norm = (/** @type {string | undefined | null} */ s) =>
	s == null ? null : s.replace(/\s+/g, ' ').trim();

/** @param {string} html */
export function describeHtml(html) {
	const root = parse(html);
	const meta = (/** @type {string} */ sel) => norm(root.querySelector(sel)?.getAttribute('content'));
	return {
		title: norm(root.querySelector('title')?.text),
		canonical: norm(root.querySelector('link[rel="canonical"]')?.getAttribute('href')),
		description: meta('meta[name="description"]'),
		robots: meta('meta[name="robots"]'),
		ogUrl: meta('meta[property="og:url"]'),
		ogTitle: meta('meta[property="og:title"]'),
		ogImage: meta('meta[property="og:image"]'),
		ids: [...new Set(root.querySelectorAll('[id]').map((el) => el.getAttribute('id')))]
			.filter(Boolean)
			.sort()
	};
}

/** @param {string} xml */
export function describeSitemap(xml) {
	return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1]).sort();
}

/** @param {string} xml */
export function describeAtom(xml) {
	return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
		.map((m) => ({
			link: m[1].match(/<link href="([^"]+)"/)?.[1] ?? null,
			id: m[1].match(/<id>([^<]+)<\/id>/)?.[1] ?? null
		}))
		.sort((a, b) => String(a.link).localeCompare(String(b.link)));
}

/** @param {string} dir */
export function describeSite(dir) {
	const files = listFiles(dir);
	/** @type {Record<string, ReturnType<typeof describeHtml>>} */
	const pages = {};
	for (const f of files) {
		if (f.endsWith('.html') && !f.startsWith('slides/')) {
			pages[f] = describeHtml(readFileSync(join(dir, f), 'utf8'));
		}
	}
	return {
		files,
		pages,
		sitemap: describeSitemap(readFileSync(join(dir, 'sitemap.xml'), 'utf8')),
		atom: describeAtom(readFileSync(join(dir, 'atom.xml'), 'utf8'))
	};
}
