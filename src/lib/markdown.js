// Build-time markdown helpers used by mdsvex (see vite.config.js).
import { createCssVariablesTheme, createHighlighter } from 'shiki';

const theme = createCssVariablesTheme({ name: 'shipit', variablePrefix: '--shiki-', fontStyle: true });
const LANGS = ['bash', 'docker', 'hcl', 'html', 'python', 'yaml'];
const highlighterPromise = createHighlighter({ themes: [theme], langs: LANGS });

/** @param {string} s */
const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * mdsvex highlighter. Renders the same wrapper markup Jekyll/Rouge produced so
 * the existing CSS keeps working, with Shiki tokens coloured via CSS variables.
 * @param {string} code
 * @param {string | null | undefined} lang
 */
export async function highlight(code, lang) {
	const language = lang || 'plaintext';
	const highlighter = await highlighterPromise;
	const known = highlighter.getLoadedLanguages().includes(language);
	const lines = known
		? highlighter.codeToTokens(code, { lang: /** @type {any} */ (language), theme: 'shipit' }).tokens.map((line) =>
				line
					.map((t) => {
						const style = [`color:${t.color}`];
						if (t.fontStyle && t.fontStyle & 1) style.push('font-style:italic');
						if (t.fontStyle && t.fontStyle & 2) style.push('font-weight:bold');
						return `<span style="${style.join(';')}">${escapeHtml(t.content)}</span>`;
					})
					.join('')
			)
		: code.replace(/\n$/, '').split('\n').map(escapeHtml);

	const html =
		`<div class="language-${language} highlighter-rouge"><div class="highlight"><pre class="highlight"><code>` +
		lines.map((l) => `<span class="line">${l}</span>`).join('\n') +
		`</code></pre></div></div>`;
	// Hand the markup to Svelte verbatim so `{`, `}` and `<` in code stay literal.
	return `{@html ${JSON.stringify(html)}}`;
}

/**
 * @typedef {{ type: string, tagName?: string, value?: string, properties?: Record<string, any>, children?: HastNode[] }} HastNode
 */

/** @param {HastNode} node @returns {string} */
const textOf = (node) =>
	node.type === 'text' ? (node.value ?? '') : (node.children ?? []).map(textOf).join('');

/**
 * Gives headings the same ids kramdown's GFM parser generated on GitHub Pages
 * and wraps their content in a self link, like the old anchor_headings include.
 * Keeping the ids identical means existing `#fragment` links keep working.
 */
export function rehypeKramdownHeadings() {
	/** @param {HastNode} tree */
	return (tree) => {
		/** @type {Map<string, number>} */
		const counter = new Map();
		/** @param {HastNode} node */
		const visit = (node) => {
			if (node.type === 'element' && /^h[1-6]$/.test(node.tagName ?? '')) {
				let id = textOf(node)
					.trim()
					.toLowerCase()
					.replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- \t]/gu, '')
					.replace(/[ \t]/g, '-');
				const n = (counter.get(id) ?? 0) + 1;
				counter.set(id, n);
				if (n > 1) id += `-${n - 1}`;
				node.properties = { ...node.properties, id };
				node.children = [
					{ type: 'element', tagName: 'a', properties: { href: `#${id}` }, children: node.children }
				];
				return;
			}
			node.children?.forEach(visit);
		};
		visit(tree);
	};
}
