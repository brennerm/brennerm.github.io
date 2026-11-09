<script>
	import { theme } from '#lib/theme.svelte.js';

	/** @type {HTMLDivElement} */
	let container;

	// Giscus maps comments by pathname, so the old discussion threads keep matching.
	$effect(() => {
		const script = document.createElement('script');
		Object.entries({
			src: 'https://giscus.app/client.js',
			'data-repo': 'brennerm/brennerm.github.io-comments',
			'data-repo-id': 'MDEwOlJlcG9zaXRvcnkzMTg1MTk0ODQ=',
			'data-category': 'Announcements',
			'data-category-id': 'DIC_kwDOEvw4vM4CAcbV',
			'data-mapping': 'pathname',
			'data-reactions-enabled': '1',
			'data-emit-metadata': '0',
			'data-theme': theme.dark ? 'dark' : 'light',
			crossorigin: 'anonymous'
		}).forEach(([k, v]) => script.setAttribute(k, v));
		script.async = true;
		container.replaceChildren(script);
	});
</script>

<section>
	<h2>Comments</h2>
	<div id="comments-giscus" bind:this={container}></div>
</section>
