# shipit.dev

Source of [shipit.dev](https://shipit.dev), built with SvelteKit, mdsvex and `adapter-static`.

```sh
npm install
npm run dev          # local dev server
npm run build        # static site in ./build
npm run check:urls   # verify the build still serves every URL of the old Jekyll site
```

- Posts live in `src/posts/<slug>.md` and are served at `/posts/<slug>.html`. Front matter: `title`, `description`, `date`, `category`, `tags`, `draft`, `thumbnail`.
- Images go in `static/static/images/` (served at `/static/images/...`). Use `<Image url=... description=... />` in posts for captioned, zoomable images.
- Pushing to `gh-pages` builds and deploys via `.github/workflows/deploy.yml`.
- `npm run build` also renders `static/cv-en.pdf` and `static/cv-de.pdf` (gitignored) from the content of `static/cv.html`, using the layout in `scripts/cv-pdf/template.mjs`. This needs Chrome installed. Under `npm run dev`, run `npm run build:cv` to create or refresh them.

## URL migration check

`scripts/url-migration/baseline.json` is a snapshot of the last Jekyll build (GitHub Pages' Jekyll 3.10): every file, plus each page's title, canonical URL, description, robots and OG tags and all element ids (heading anchors), the sitemap URLs and the Atom entry ids. `npm run check:urls` compares a build against it and fails if anything was lost. It runs in CI on every push.

## New post template

```md
---
date: 2026-01-01
title: "Title"
description: "One sentence for search engines and social cards"
category: posts
tags: [kubernetes]
draft: true
thumbnail: some-image.png
---
```

`src/posts/sources/` holds source files that belong to posts (example code, diagrams); they are not published.
