<script>
	import '../app.css';
	import { afterNavigate } from '$app/navigation';
	import Zooming from 'zooming';
	import Sidebar from '#lib/components/Sidebar.svelte';

	/** @type {{ children: import('svelte').Snippet }} */
	let { children } = $props();

	/** @type {any} */
	let zooming;
	let firstLoad = true;

	afterNavigate(() => {
		zooming ??= new Zooming({ bgColor: 'var(--main-background-color)' });
		zooming.listen('.img-zoomable');

		// goatcounter only counts the initial page load by itself
		const gc = /** @type {any} */ (window).goatcounter;
		if (!firstLoad && gc?.count && location.host === 'shipit.dev') gc.count({ path: location.pathname });
		firstLoad = false;
	});
</script>

<svelte:head>
	<script>
		if (window.location.host !== 'shipit.dev') window.goatcounter = { no_onload: true };
	</script>
	<script data-goatcounter="https://brennerm.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
</svelte:head>

<Sidebar />
<div id="content-parent">
	{@render children()}
</div>
