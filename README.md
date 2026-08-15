# Tushar Nikam — champ96k.com

Personal corner of the internet: [projects](https://champ96k.com/projects), open-source work, writing, values, career and a bit about a software engineer who happens to live in India.

Built with [Astro](https://astro.build) (static site, near-zero client JS), TypeScript, MDX and hand-written CSS. No Tailwind, no CMS, no database, no build-time network calls (GitHub data is synced ahead of time into JSON, see below).

## Quick start

```bash
npm install
npm run dev        # local dev server (http://localhost:4321)
npm run build      # static build to dist/
npm run preview    # preview the built site
npm run check      # astro check (types + content schemas)
npm run test:pages # DOM checks against a running preview (port 4321)
npm run sync:github # pull latest GitHub repos/contributions into src/data/github/*.json
```

> **Known quirk:** if your shell exports an invalid `GITHUB_TOKEN`, sync fails. Run it as `env -u GITHUB_TOKEN npm run sync:github`. It works fine without a token on public data (rate-limited to ~60 requests/hour).

> **Multiple dev/preview servers:** `astro dev` refuses to start if another is running. Stop strays with `npx astro dev stop` / `npx astro preview stop`, or run on another port (`npm run dev -- --port 4322`).

## How the site is organized

Everything user-editable lives in YAML files under `src/data/` (each mapped to a content schema in `src/content.config.ts`). Components never hardcode content, so you edit data without touching code. Date-sorted lists sort newest → oldest automatically.

| Page | Data file | What each entry looks like |
|---|---|---|
| Home hero, About intro | `src/data/profile.yaml` | name, headline, tagline (split into paragraphs by blank lines), about, email, image |
| Home "Find me", footer | `src/data/social.yaml` | one block per platform (label, handle, url) |
| Projects (list + detail) | `src/data/projects.yaml` | see [Adding/updating a project](#projects) |
| Open Source | `src/data/open-source.yaml` | curated list + **synced GitHub data** (see [Open source](#open-source)) |
| Writing | `.md`/`.mdx` in `src/content/writing/` | see [Writing](#writing) |
| About career | `src/data/career.yaml` | company, role, dates, description, technologies, image |
| About education | `src/data/education.yaml` | institution, degree, field, dates, description, image |
| About volunteering | `src/data/volunteering.yaml` | org, role, dates, description, link, image |
| Values | `src/data/values.yaml` | order, title, description |

All career/education/volunteering entries accept an optional `image:` (path like `/logos/foo.png` or a URL) shown as the timeline logo. Start from `/logo-placeholder.svg` if you don't have a real logo yet.

---

## Projects

Projects live in **`src/data/projects.yaml`** as a list. Only `id`, `title` and `date` are required. Append a new entry anywhere — the site sorts by `date` newest first.

```yaml
- id: my-project-slug
  title: My Project
  description: One line about what it is.
  date: 2026-08-15          # YYYY-MM-DD, usually the repo creation date
  type: Website             # badge: App / Website / Tool / Library / Experiment ...
  tags: [Web, Tool]
  status: Live              # Live / Active / Open Source ...
  url: https://example.com  # optional live link
  github: https://github.com/champ96k/my-project
```

Every entry with a unique `id` automatically gets a detail page at `/projects/<id>` (see `src/pages/projects/[slug].astro`). Fields that enrich the detail page:

```yaml
  overview: Longer paragraph about the project.
  what_i_built:
    - Bullet about the part you built
    - Another bullet
  technologies: [Dart, Flutter, REST]
  image: /path/to/logo.png        # put the file in public/ first
  links:                          # store-links row (like PeakFit / Contest Hub)
    - label: App Store
      url: https://apps.apple.com/app/id000000000
    - label: Play Store
      url: https://play.google.com/store/apps/details?id=com.champ96k.app
```

If a project has none of `overview`/`what_i_built`/`technologies`/`links`, the detail page shows "More details coming soon."

---

## Open Source

The `/open-source` page has two parts.

### 1. `my_projects` — repos you own (curated + dynamic)

In `src/data/open-source.yaml`, list each repo you want to feature. The **only required field is `repository: owner/name`** — title, description, stars, tags, language and dates are pulled from your synced GitHub data at build time. Override any of them by adding the field:

```yaml
my_projects:
  - repository: champ96k/quanta_db
    title: QuantaDB          # optional display override
    role: Author
    homepage: https://quantadb.netlify.app/   # optional live link
    description: Override description...      # optional
    tags: [Dart, Flutter]                     # optional; defaults to GitHub topics
    image: /logos/quanta-db.png               # optional logo
```

### 2. `contributions` — PRs to other people's repos

**You usually don't write this by hand.** The `contributions:` block in `open-source.yaml` is only a *fallback* for old PRs that the GitHub search no longer returns (the WHO ones are kept here). Everything is deduped by `repo + PR number`, synced data wins.

Sync pulls every PR you authored in repos you don't own, and the page shows only **Open** and **Merged** states. To refresh:

```bash
env -u GITHUB_TOKEN npm run sync:github   # see src/data/github/contributions.json
```

The deploy workflow (`.github/workflows/deploy.yml`) runs this automatically every day at 03:37 UTC, on every push to `main`, and on manual dispatch — and redeploys, so contributions keep themselves fresh once pushed.

---

## Writing

Add a Markdown (or MDX) file under **`src/content/writing/`**, e.g. `src/content/writing/my-post.md`. Frontmatter:

```markdown
---
title: My post title
description: A sentence that summarizes the post.
date: 2026-08-15
type: Technical                 # Technical / Notes / Opinion ...
tags: [Meta, Astro]
draft: false                    # optional; true hides it from lists
---

Your post body in Markdown.
```

Posts automatically appear on `/writing`, on the home "Recent writing" preview (latest 5), and in the RSS feed. Filenames become the URL slug.

---

## About me, career, education, volunteering

- **About intro + home tagline** → `src/data/profile.yaml`. The `tagline` supports paragraph breaks: insert a blank line between blocks. The home hero also highlights `Gojek` and `GoPay` in yellow (do it by editing `src/pages/index.astro` + `src/styles/global.css`).
- **Career timeline** → `src/data/career.yaml`. Entries: `company`, `role`, `employment`, `start`/`end` (`YYYY-MM` or `present`), `location`, `image`, `company_url`, `description`, `highlights`, `technologies`. Newest first is automatic.
- **Education** → `src/data/education.yaml`: `institution`, `degree`, `field`, `start`, `end`, `description`, `image`.
- **Volunteering** → `src/data/volunteering.yaml`: `org`, `role`, `start`, `end`, `description`, `link`, `image`.
- **Values** → `src/data/values.yaml`. `order` controls display order; titles/descriptions are verbatim quotes, keep them exact.

**Important:** after editing any YAML, if a page keeps showing old content, the Astro content cache is stale. Clear it and rebuild:

```bash
rm -rf .astro node_modules/.astro dist && npm run build
```

---

## Local helper script

[`scripts/site.mjs`](scripts/site.mjs) wraps the common workflows into one command so you don't have to remember the flags:

```bash
node scripts/site.mjs dev          # start dev server, stopping any stray one first
node scripts/site.mjs build        # clear stale cache, type-check, build
node scripts/site.mjs preview      # clear cache, build, serve dist, run DOM checks
node scripts/site.mjs sync         # GitHub sync (ignores a bad GITHUB_TOKEN)
node scripts/site.mjs verify       # rebuild + DOM checks against a fresh preview
node scripts/site.mjs help
```

## Deployment & checks

GitHub Pages via `actions/deploy-pages` (`.github/workflows/deploy.yml`). Pushing to `main` builds and deploys. Scheduled runs keep GitHub data fresh.

- `npm run check` — type/content errors (no warnings expected; a handful of Zod deprecation hints are harmless).
- `npm run test:pages` — DOM assertions against a preview on port 4321 (`scripts/dom-check.mjs`).
- `scripts/visual-check.mjs` — smoke-tests core routes over HTTP.

## Migrated from Flutter

This repo previously held a Flutter app (kept on the `develop` branch). The `main` branch now holds the Astro site; the old implementation was intentionally left out of the redesign.