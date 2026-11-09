<script>
	import { formatDate } from '#lib/format.js';

	/** @type {{ posts: import('#lib/posts.js').Post[] }} */
	let { posts } = $props();
</script>

<ul class="listing">
	{#each posts as post (post.slug)}
		<li>
			<a href={post.url}>{post.title}</a>
			<div>{post.readTime} - {formatDate(post.date)}</div>
		</li>
	{/each}
</ul>
