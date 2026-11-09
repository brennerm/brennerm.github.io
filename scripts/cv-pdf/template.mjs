// A4 print layout for the CV. Content comes from static/cv.html, see build.mjs.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const fontFace = (weight, style = 'normal') => {
	const file = require.resolve(`@fontsource/nunito-sans/files/nunito-sans-latin-${weight}-${style}.woff2`);
	const data = readFileSync(file).toString('base64');
	return `@font-face {
		font-family: 'Nunito Sans';
		font-weight: ${weight};
		font-style: ${style};
		src: url(data:font/woff2;base64,${data}) format('woff2');
	}`;
};

const escape = (text) =>
	text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const section = (heading, body) => `<section><h2>${escape(heading)}</h2>${body}</section>`;

const job = (entry) => `<article>
	<div class="job-head">
		<h3>${escape(entry.title)}</h3>
		<span class="period">${escape(entry.period)}</span>
	</div>
	<p class="company">${escape(entry.company)} <span class="industry">· ${escape(entry.industry)}</span></p>
	<p>${escape(entry.description)}</p>
	<p class="tech">${entry.tech.map(escape).join(' · ')}</p>
</article>`;

export function renderCv(cv) {
	return `<!DOCTYPE html>
<html lang="${cv.lang}">
<head>
<meta charset="UTF-8" />
<title>${escape(cv.name)} – ${escape(cv.documentTitle)}</title>
<style>
	${fontFace(400)}
	${fontFace(400, 'italic')}
	${fontFace(600)}
	${fontFace(700)}

	* { box-sizing: border-box; margin: 0; padding: 0; }

	body {
		font: 400 9.5pt/1.42 'Nunito Sans', sans-serif;
		color: #334155;
	}

	a { color: inherit; text-decoration: none; }

	header {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		padding-bottom: 4mm;
		border-bottom: 1.5pt solid #2563eb;
	}

	h1 { font-size: 25pt; font-weight: 700; line-height: 1.1; color: #0f172a; }
	.job-title { font-size: 11.5pt; color: #2563eb; font-weight: 600; margin-top: 1mm; }
	.contact { list-style: none; text-align: right; font-size: 9pt; line-height: 1.45; }

	section { margin-top: 5.5mm; }

	h2 {
		font-size: 9pt;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #2563eb;
		margin-bottom: 2mm;
		break-after: avoid;
	}

	.profile p + p, .profile ul + p { margin-top: 1.4mm; }
	.profile ul { margin: 1mm 0 0 4mm; }
	.disclaimer { font-size: 8pt; font-style: italic; color: #64748b; }

	.skills {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 0.8mm 5mm;
	}
	.skills dt { font-weight: 600; color: #0f172a; }

	article { break-inside: avoid; }
	article + article { margin-top: 3.6mm; }

	.job-head { display: flex; justify-content: space-between; align-items: baseline; gap: 6mm; }
	h3 { font-size: 10.5pt; font-weight: 700; color: #0f172a; }
	.period { font-size: 9pt; color: #475569; white-space: nowrap; font-variant-numeric: tabular-nums; }
	.company { font-weight: 600; color: #1e293b; }
	.industry { font-weight: 400; font-size: 8.5pt; color: #64748b; }
	.tech { margin-top: 0.6mm; font-size: 8.5pt; color: #1d4ed8; }

	.columns { display: grid; grid-template-columns: 1fr 1fr; gap: 0 8mm; break-inside: avoid; }
	.columns ul { list-style: none; }
	.columns li + li { margin-top: 0.8mm; }
</style>
</head>
<body>
	<header>
		<div>
			<h1>${escape(cv.name)}</h1>
			<p class="job-title">${escape(cv.jobTitle)}</p>
		</div>
		<ul class="contact">
			<li>${escape(cv.location)}</li>
			${cv.contact.map((link) => `<li><a href="${escape(link.href)}">${escape(link.label)}</a></li>`).join('\n\t\t\t')}
		</ul>
	</header>
	<main>
		${section(
			cv.headings.profile,
			`<div class="profile">
				<p>${escape(cv.profile.intro)}</p>
				<p>${escape(cv.profile.servicesIntro)}</p>
				<ul>${cv.profile.services.map((service) => `<li>${escape(service)}</li>`).join('')}</ul>
				<p>${escape(cv.profile.more)} ${escape(cv.profile.contact)}</p>
				<p class="disclaimer">${escape(cv.profile.disclaimer)}</p>
			</div>`
		)}
		${section(
			cv.headings.skills,
			`<dl class="skills">${cv.skills
				.map((skill) => `<dt>${escape(skill.label)}</dt><dd>${escape(skill.value)}</dd>`)
				.join('')}</dl>`
		)}
		${section(cv.headings.experience, cv.experience.map(job).join('\n'))}
		<div class="columns">
			${section(cv.headings.education, `<p>${escape(cv.education)}</p>`)}
			${section(
				cv.headings.projects,
				`<ul>${cv.projects.map((project) => `<li>${escape(project)}</li>`).join('')}</ul>`
			)}
		</div>
		<div class="columns">
			${section(
				cv.headings.languages,
				`<ul>${cv.languages.map((language) => `<li>${escape(language)}</li>`).join('')}</ul>`
			)}
			${section(
				cv.headings.hobbies,
				`<ul>${cv.hobbies.map((hobby) => `<li>${escape(hobby)}</li>`).join('')}</ul>`
			)}
		</div>
		${section(cv.headings.values, `<p>${escape(cv.values)}</p>`)}
	</main>
</body>
</html>`;
}

export function renderFooter(cv) {
	return `<style>${fontFace(400)}</style>
	<div style="width: 100%; padding: 0 18mm; display: flex; justify-content: space-between; font: 7.5pt 'Nunito Sans', sans-serif; color: #64748b;">
		<span>${escape(cv.name)} · ${escape(cv.documentTitle)}</span>
		<span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
	</div>`;
}
