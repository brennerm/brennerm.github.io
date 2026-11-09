// GitHub Pages also serves `/posts/foo` for `/posts/foo.html`, and old links use
// both forms. Map the extensionless form onto the `.html` routes so client-side
// navigation and hydration work for either.
const EXTENSIONLESS = /^\/(posts\/[^/.]+|tag\/[^/.]+|about|side_projects|talks|imprint)$/;

/** @type {import('@sveltejs/kit/hooks').Reroute} */
export function reroute({ url }) {
	if (EXTENSIONLESS.test(url.pathname)) return `${url.pathname}.html`;
}
