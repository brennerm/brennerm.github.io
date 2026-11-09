<script>
	/** @type {{ url: string, description?: string, source?: string, height?: string, width?: string }} */
	let { url, description = '', source, height, width } = $props();

	// Some captions contain links, so the description is author-provided HTML.
	const alt = $derived(description.replace(/<[^>]*>/g, ''));
</script>

<figure class="image">
	<img src={url} {alt} {height} {width} loading="lazy" class="img-zoomable" />
	<figcaption>
		{@html description}
		{#if source}
			/ <a href={source} rel="nofollow" target="_blank">image source</a>
		{/if}
	</figcaption>
</figure>
