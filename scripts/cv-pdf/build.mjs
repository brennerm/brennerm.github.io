// Renders static/cv-<lang>.pdf from the content of static/cv.html.
// Uses the installed Chrome, which is also preinstalled on GitHub's Ubuntu runners.
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';
import { renderCv, renderFooter } from './template.mjs';

const source = pathToFileURL(resolve('static/cv.html')).href;

// Runs inside cv.html, which already knows how to switch its own language
function readCv(lang) {
	setLanguage(lang);

	const clean = (element) => element.textContent.replace(/\s+/g, ' ').trim();
	const key = (name, root = document) => clean(root.querySelector(`[data-i18n="${name}"]`));
	const suffix = (root, name) => clean(root.querySelector(`[data-i18n$="-${name}"]`));
	const all = (selector) => [...document.querySelectorAll(selector)];

	return {
		lang,
		name: clean(document.querySelector('h1')),
		documentTitle: key('cv-title'),
		jobTitle: key('job-title'),
		location: key('location'),
		contact: all('aside a').map((link) => ({
			href: link.href,
			label: clean(link).replace(/^https?:\/\//, '')
		})),
		headings: {
			profile: key('profile'),
			skills: key('skills'),
			experience: key('work-experience'),
			education: key('education'),
			projects: key('projects'),
			languages: key('languages'),
			hobbies: key('hobbies'),
			values: key('values')
		},
		profile: {
			intro: key('profile-intro'),
			servicesIntro: key('profile-services-intro'),
			services: all('[data-i18n^="service"]').map(clean),
			more: key('profile-more'),
			contact: key('profile-contact'),
			disclaimer: key('profile-disclaimer')
		},
		skills: all('aside ul:has(span) > li').map((item) => {
			const label = clean(item.querySelector('span'));
			return {
				label: label.replace(/:$/, ''),
				value: clean(item).slice(label.length).trim()
			};
		}),
		experience: all('article').map((article) => ({
			title: suffix(article, 'title'),
			company: suffix(article, 'company'),
			industry: suffix(article, 'industry'),
			period: suffix(article, 'period'),
			description: suffix(article, 'desc'),
			tech: [...article.querySelectorAll(':scope > div:last-child > span')].map(clean)
		})),
		education: key('education-degree'),
		projects: all('[data-i18n^="project"]:not([data-i18n="projects"])').map(clean),
		languages: [key('german-native'), key('english-fluent')],
		hobbies: all('[data-i18n^="hobby-"]').map(clean),
		values: key('values-desc')
	};
}

const browser = await chromium.launch({ channel: 'chrome' });
try {
	const context = await browser.newContext();
	// Only the page's text is needed, so skip its CDN styles and fonts
	await context.route(/^https?:/, (route) => route.abort());

	const sourcePage = await context.newPage();
	await sourcePage.goto(source, { waitUntil: 'domcontentloaded' });

	for (const lang of ['en', 'de']) {
		const cv = await sourcePage.evaluate(readCv, lang);

		const page = await context.newPage();
		await page.setContent(renderCv(cv), { waitUntil: 'load' });
		await page.evaluate(() => document.fonts.ready);

		const path = resolve(`static/cv-${lang}.pdf`);
		await page.pdf({
			path,
			format: 'A4',
			printBackground: true,
			tagged: true,
			outline: true,
			displayHeaderFooter: true,
			headerTemplate: '<span></span>',
			footerTemplate: renderFooter(cv),
			margin: { top: '15mm', right: '18mm', bottom: '16mm', left: '18mm' }
		});
		await page.close();
		console.log(`Wrote ${path}`);
	}
} finally {
	await browser.close();
}
