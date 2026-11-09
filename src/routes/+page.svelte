<script>
	import PostList from '#lib/components/PostList.svelte';
	import Seo from '#lib/components/Seo.svelte';

	/** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

<Seo title="Posts" path="/" />

<section class="content">
	<PostList posts={data.posts} />
</section>
