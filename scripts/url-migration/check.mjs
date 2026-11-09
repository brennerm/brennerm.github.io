// Checks that the SvelteKit build still serves everything the Jekyll site did:
// every file path, the SEO-relevant tags of every page, all heading anchors,
// the sitemap and the Atom feed entries. Usage:
//   npm run build && npm run check:urls
import { readFileSync } from 'node:fs';
import { describeSite } from './extract.mjs';

// Assets intentionally replaced by the SvelteKit bundle. Nothing links to them
// from outside the site, so dropping them does not affect SEO.
const RETIRED = new Set([
	'static/css/base.css',
	'static/js/application.js',
	'static/js/predomload.js'
]);

// Values that are expected to differ and are not SEO relevant.
const PAGE_FIELDS = /** @type {const} */ ([
	'title',
	'canonical',
	'description',
	'robots',
	'ogUrl',
	'ogTitle',
	'ogImage'
]);

const buildDir = process.argv[2] ?? 'build';
const baseline = JSON.parse(readFileSync(new URL('./baseline.json', import.meta.url), 'utf8'));
const current = describeSite(buildDir);

/** @type {string[]} */
const errors = [];
const currentFiles = new Set(current.files);

for (const f of baseline.files) {
	if (RETIRED.has(f)) continue;
	if (!currentFiles.has(f)) errors.push(`missing file: /${f}`);
}

for (const [path, old] of Object.entries(baseline.pages)) {
	const now = current.pages[path];
	if (!now) continue; // already reported as a missing file
	for (const field of PAGE_FIELDS) {
		if (old[field] !== now[field]) {
			errors.push(`/${path}: ${field} changed\n    old: ${old[field]}\n    new: ${now[field]}`);
		}
	}
	const ids = new Set(now.ids);
	const lost = old.ids.filter((/** @type {string} */ id) => !ids.has(id));
	if (lost.length) errors.push(`/${path}: anchors no longer present: ${lost.map((i) => '#' + i).join(', ')}`);
}

const sitemap = new Set(current.sitemap);
for (const loc of baseline.sitemap) {
	if (!sitemap.has(loc)) errors.push(`sitemap.xml: missing ${loc}`);
}

const atom = new Map(current.atom.map((/** @type {{link: string, id: string}} */ e) => [e.link, e.id]));
for (const e of baseline.atom) {
	if (!atom.has(e.link)) errors.push(`atom.xml: missing entry ${e.link}`);
	else if (atom.get(e.link) !== e.id) errors.push(`atom.xml: id of ${e.link} changed (${e.id} -> ${atom.get(e.link)})`);
}

const added = current.files.filter((f) => !baseline.files.includes(f) && !f.startsWith('_app/') && !f.endsWith('__data.json'));

const pageCount = Object.keys(baseline.pages).length;
console.log(`Checked ${baseline.files.length} files, ${pageCount} pages, ${baseline.sitemap.length} sitemap URLs and ${baseline.atom.length} feed entries.`);
if (added.length) console.log(`New files (fine, just FYI):\n  ${added.join('\n  ')}`);
if (errors.length) {
	console.error(`\n${errors.length} problem(s):\n- ${errors.join('\n- ')}`);
	process.exit(1);
}
console.log('All old URLs are still served. ✔');
