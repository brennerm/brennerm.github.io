<script>
	import PostList from '#lib/components/PostList.svelte';
	import Seo from '#lib/components/Seo.svelte';

	/** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

<Seo title="Tag: {data.tag}" path="/tag/{data.tag}" robots="noindex" />

<section class="content">
	<h1>[ {data.tag} ]</h1>
	<PostList posts={data.posts} />
</section>
