# hanna-insurances

Marketing site for an insurance and finance advisor (Hanna Khudziakova, Zielona Góra).
Next.js 15 (App Router) + Tailwind v4. Page copy is in Polish; code and docs are in English.

## Getting started

```bash
npm install
npm run dev
```

Node 24.17.0 and npm 11.13.0, pinned in `engines` and `.nvmrc`. Every dependency version
is exact: no `^`, no `~`. `.npmrc` sets `save-exact=true`, so `npm install <pkg>` pins
automatically.

## Scripts

- `npm run dev` - development server
- `npm run build` - production build
- `npm start` - serve the production build
- `npm test` - unit tests (Vitest)
- `npm run test:e2e` - end-to-end tests and the regression guard (Playwright)
- `npm run format` - Prettier over `src/`

Do not run `npm run build` while a dev server is up: both write `.next`, and the running
dev server starts serving a webpack runtime error. Stop dev, `rm -rf .next`, then build.

## Routes

All four are prerendered as static content, alongside `/sitemap.xml`, `/robots.txt` and
`/icon.svg`.

| Route | Notes |
| --- | --- |
| `/` | Hero, partner marquee, journey, services, partners, consultation |
| `/about-me` | The advisor page |
| `/privacy-policy` | Placeholder. `noindex` until it carries real text |
| 404 | `src/app/not-found.tsx` |

## Architecture

Server Components by default. `"use client"` appears only on the smallest leaf that needs
browser APIs, with server-rendered markup passed in as `children`. Shared components live
in `src/components/`; route-specific ones sit in `src/app/<route>/_components/`. All page
copy lives in `src/content/`, never inline in markup.

Components are named arrow consts. Route files (`page.tsx`, `not-found.tsx`) default-export,
because Next requires it.

## Tests

Unit tests cover components and content invariants. `tests/unit/site-invariants.test.tsx`
holds the site-wide guards: no dropped eyebrow or decorative quote mark, no em-dash, no
English URL slug in Polish prose, no Tailwind value that silently emits no CSS, heading
typography, no static full-viewport unit, no commented-out code.

`tests/e2e/regression-guard.spec.ts` encodes the brief's regression table, including the
assertion that the whole site is readable with JavaScript disabled.

Every guard here was mutation-checked: the defect it describes was reintroduced and the
test was confirmed to fail. A guard that has never been seen to fail is not a guard.

## Documentation

- `DESIGN-BRIEF.md` - design direction, inherited constraints, retire list, open blockers
- `docs/superpowers/plans/` - implementation plans
- `docs/LEARNINGS.md` - non-obvious findings, with the reasoning behind each

The legacy vanilla implementation (`index.html`, `poznaj-hanne.html`, `styles.css`,
`script.js`) was removed once parity was verified. Component comments cite it by file and
line; those citations resolve against git history.

## Status

Migration off the vanilla implementation is complete. Design work is deliberately deferred
until after the migration; see `DESIGN-BRIEF.md` sections 4 and 8.

Not shippable yet. The blockers are content and legal, not code, and are listed in
`DESIGN-BRIEF.md` section 8.3: the real phone, email and domain (`src/content/site.ts`
still carries `https://example.invalid`), the Lendi widget embed code, photography, the
legal texts, and cookie consent, which is Task 16 of the migration plan.
