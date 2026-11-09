<script>
	import { site } from '#lib/site.js';

	/**
	 * @type {{
	 *   title: string,
	 *   path: string,
	 *   description?: string,
	 *   article?: { date: string, tags: string[] },
	 *   image?: string,
	 *   robots?: string
	 * }}
	 */
	let { title, path, description = '', article, image, robots } = $props();
	const url = $derived(site.url + path);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta content={title} property="og:title" />
	<meta content={article ? 'article' : 'website'} property="og:type" />
	{#if description}<meta content={description} property="og:description" />{/if}
	<meta content={url} property="og:url" />
	{#if article}
		<meta content="{article.date}T00:00:00+00:00" property="article:published_time" />
		<meta content="{site.url}/about/" property="article:author" />
		{#each article.tags as tag (tag)}<meta content={tag} property="article:tag" />{/each}
	{/if}
	{#if image}<meta content="{site.url}/static/images/{image}" property="og:image" />{/if}
	{#if robots}<meta name="robots" content={robots} />{/if}
	<link rel="canonical" href={url} />
</svelte:head>
