// One-off: record what the old Jekyll build served, so the SvelteKit build can
// be checked against it. Usage:
//   jekyll build -d /tmp/jekyll_site   (on the last Jekyll commit)
//   node scripts/url-migration/snapshot.mjs /tmp/jekyll_site
import { writeFileSync } from 'node:fs';
import { describeSite } from './extract.mjs';

const dir = process.argv[2];
if (!dir) {
	console.error('usage: snapshot.mjs <jekyll _site dir>');
	process.exit(2);
}
const out = new URL('./baseline.json', import.meta.url);
writeFileSync(out, JSON.stringify(describeSite(dir), null, '\t') + '\n');
console.log(`wrote ${out.pathname}`);
