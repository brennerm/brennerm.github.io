<script>
	import Comments from '#lib/components/Comments.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { formatDate } from '#lib/format.js';
	import { site } from '#lib/site.js';

	/** @type {import('./$types').PageProps} */
	let { data } = $props();
	const post = $derived(data.post);
	const Content = $derived(data.Content);
</script>

<Seo
	title={post.title}
	path={post.url}
	description={post.description}
	article={{ date: post.date, tags: post.tags }}
	image={post.thumbnail}
/>

<section class="content">
	<h1><a href={post.url}>{post.title}</a></h1>

	<section class="byline">
		{post.readTime} - {formatDate(post.date)} -
		<span class="taglist"
			>[
			{#each post.tags as tag (tag)}
				<a href="/tag/{tag}.html"><code>{tag}</code></a>
			{/each}
			]</span
		>
	</section>

	<Content />

	{#key post.slug}
		<Comments />
	{/key}

	<section class="contact">
		If you have questions or want to give feedback feel free to contact me.<br />
		<a href={site.github} target="_blank" aria-label="GitHub"><i class="icon-2x icon-github-circled"></i></a>
		<a href="https://twitter.com/{site.twitter}" target="_blank" aria-label="Twitter"><i class="icon-2x icon-twitter"></i></a>
		<a href="mailto:{site.email}" class="icon-2x icon-mail" aria-label="Mail"></a>
	</section>
</section>
