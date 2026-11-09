<script>
	import { site } from '#lib/site.js';
	import { theme, toggleTheme } from '#lib/theme.svelte.js';

	const [firstName, lastName] = site.name.split(' ');
</script>

<section class="sidebar">
	<a href="/">
		<img src="/static/images/apple-touch-icon.png" height="75" width="75" class="avatar" alt={site.name} />
	</a>

	<section class="name">
		<a href="/">
			<span id="fname" class="fname">{firstName}</span>
			<span id="lname" class="lname">{lastName}</span>
			<span class="fname">DevOps</span>
			<span class="lname">Freelancer</span>
		</a>
	</section>

	<section class="meta">
		<a href={site.github} target="_blank" aria-label="GitHub"><i class="icon icon-github-circled"></i></a>
		<a href="https://twitter.com/{site.twitter}" target="_blank" aria-label="Twitter"><i class="icon icon-twitter"></i></a>
		<a href="mailto:{site.email}" target="_blank" aria-label="Mail"><i class="icon icon-mail"></i></a>
		<a href="/atom.xml" target="_blank" aria-label="Atom feed"><i class="icon icon-rss"></i></a>
	</section>

	<section class="sections">
		<ul>
			<li><a href="/about.html">about</a></li>
			<li><a href="/">posts</a></li>
			<li><a href="/side_projects.html">side projects</a></li>
			<li><a href="/talks.html">talks</a></li>
			<li><a href="/imprint.html">imprint</a></li>
			<li>
				<a id="theme-toggle" href="#theme-toggle" role="button" onclick={(e) => (e.preventDefault(), toggleTheme())}
					>{theme.dark ? 'light mode' : 'dark mode'}</a
				>
			</li>
		</ul>
	</section>
</section>
