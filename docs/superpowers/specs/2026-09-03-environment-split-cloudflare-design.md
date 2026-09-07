# Environment split: prod and dev on Cloudflare

**Date:** 2026-09-03
**Revised:** 2026-09-07 - domain chosen and bought, branch name settled, section
6.1 on automatic deployment added, section 5 implemented.
**Status:** section 5 is done on branch `feat/cloudflare-static-export` (83 unit
tests and 101 end-to-end tests green, the export builds). The infrastructure
steps of section 6, 4 through 10, have not been started.
**Domain:** `hannainsurance.pl`
**Dev branch:** `develop`

---

## 1. The task

Put the site on its own domain in two environments:

- **prod** - public, deployed from `main`
- **dev** - closed to outsiders, deployed from `develop`

The domain is bought at home.pl because `.pl` registration is available there.
Use is commercial: this is a working insurance agent's site, not a personal
project.

---

## 2. The decision, and why this one

**Hosting is Cloudflare Workers with static assets. The domain is registered at
home.pl but its NS are delegated to Cloudflare.** One vendor answers for domain,
DNS, CDN and access control.

Rejected options and why:

| Option | Why not |
| --- | --- |
| Vercel Hobby | The plan's terms cover non-commercial personal projects only. Use here is commercial. |
| Vercel Pro | $20/month, and it is not enough: Standard Protection does not cover the project's production domain, and the "All Deployments" scope that does cover it belongs to Advanced Deployment Protection - an add-on at a further $150/month. |
| Vercel Hobby + Cloudflare Access over `dev.hannainsurance.pl` | Leaves a hole: the generated `*.vercel.app` keeps serving the same site publicly, past Cloudflare's proxy, and nothing on the free plan can close it. |
| Cloudflare Pages | The built-in preview protection (Settings → General → Enable access policy) covers preview URLs and branch aliases only, not the production `*.pages.dev` domain and not custom domains. Cloudflare is also moving new projects to Workers. |

The deciding argument for Workers: **`workers_dev = false` removes the
`*.workers.dev` address entirely**, and with it, by default, the preview URLs
(`preview_urls` follows `workers_dev`). The dev application is then left with
exactly one entrance - `dev.hannainsurance.pl`, proxied by Cloudflare - and
Access closes that one completely. The hole that disqualified both Vercel
options cannot open here by construction, rather than by configuration.

Cloudflare's free plan does not forbid commercial use. Zero Trust Free covers up
to 50 users.

---

## 3. Target architecture

```
home.pl              registrar for hannainsurance.pl
                     NS delegated -> Cloudflare

Cloudflare zone      hannainsurance.pl, SSL/TLS = Full (strict)

Worker "hanna-prod"  <- branch main
                     hannainsurance.pl, www.hannainsurance.pl
                     public

Worker "hanna-dev"   <- branch develop
                     dev.hannainsurance.pl
                     workers_dev = false
                     Cloudflare Access: Allow by email list, One-time PIN
```

Both Workers are built from the same repository and differ only in their branch
and their environment variables.

---

## 4. What was verified by measurement

Checked 2026-09-03 against `main` as it then stood.

**The site is entirely static.** A search of `src/` found no server mechanism of
any kind: no route handlers, no `use server`, no `revalidate`, no
`export const dynamic`, no `cookies()` and no `headers()`. Four routes, three
client components. `next.config.ts` held only `reactStrictMode`. Exactly one
platform feature is in use: `next/image` in `src/app/_components/Partners.tsx`,
for four raster logos.

**The static export builds, but not out of the box.** With `output: 'export'`
the build fails:

```
Error: export const dynamic = "force-static"/export const revalidate not
configured on route "/robots.txt" with "output: export".
```

This is not a defect in the code but a Next 15 requirement for route-like
metadata files. After adding `export const dynamic = 'force-static'` to
`src/app/robots.ts` and `src/app/sitemap.ts` the build completes: 9 pages,
export 2 of 2, 2.0 MB in total.

**The export preserves what the guard tests protect.** `out/` contains
`404.html`, `robots.txt` and `sitemap.xml`; `out/privacy-policy.html` still
carries `<meta name="robots" content="noindex, follow"/>`; the logos in
`Partners` came out as ordinary references to files under `/logos/`.

The working tree was restored afterwards; no changes were left behind.

---

## 5. Code changes

1. **`next.config.ts`** - add `output: 'export'` and
   `images: { unoptimized: true }`. Turning optimization off affects the four
   logos, which render small enough that nothing is visibly lost.

2. **`src/app/robots.ts` and `src/app/sitemap.ts`** - add
   `export const dynamic = 'force-static'`. The build does not pass without it.

3. **`src/content/site.ts`** - `baseUrl` stops being the constant
   `https://example.invalid` and comes from an environment variable
   (`NEXT_PUBLIC_SITE_URL`), different for the two Workers. Without this, dev
   would declare itself the production domain in canonical, Open Graph and the
   sitemap. This closes the "Production domain" blocker in `DESIGN-BRIEF.md` 8.3.

   **This is a build-time variable, not a runtime one.** Under static export its
   value is inlined into the HTML and JS by `next build`; after that the Worker
   only serves finished files, and no runtime exists for it to be read in. So
   `vars` in `wrangler.jsonc` are useless here: it has to be set as a **build
   variable** in Workers Builds, separately per trigger. Cloudflare documents
   this directly - unlike Pages, Workers do not share one set of build-time and
   runtime variables.

4. **`src/app/robots.ts`** - serve `disallow: /` on dev, so the closed
   environment stays out of the index even if Access is ever switched off. The
   signal for which environment this is: the same variable as in item 3, or a
   separate one.

5. **Playwright** - ~~`tests/e2e` currently expect `next start`~~. Corrected
   during implementation: the config launched `npm run dev`, not `next start`.
   First moved to a hand-written static server, then, once `wrangler.jsonc`
   existed, to `npm run build && npx wrangler dev --port 3000`. The same runtime
   backs `npm start`, because `next start` refuses to run at all under
   `output: 'export'`.

6. **Unit tests** - ~~`tests/unit/site-invariants.test.tsx` depends on
   `site.baseUrl` being a constant~~. Checked during implementation: it does
   not, and the file does not mention `baseUrl` once. No edits were needed. The
   real consumers of `baseUrl` are `structured-data.test.ts`, which already
   mocks the module, and `layout.tsx` through `metadataBase`. Two new files were
   added instead: `tests/unit/site-config.test.ts` and
   `tests/unit/robots.test.ts`.

7. **Production is identified by a constant, not by a variable.**
   `site.productionHost` holds the one host allowed to invite crawlers, and
   `robots.ts` compares the host from `baseUrl` against it. A forgotten or
   mistyped `NEXT_PUBLIC_SITE_URL` therefore yields `Disallow: /` rather than an
   indexed dev site: the mistake falls closed. This answers the "or a separate
   one" of item 4 - there is no separate variable, so there is nothing to
   forget.

---

## 6. Order of work

The code is prepared **before** the Workers are created, so that no build is
ever published with knowingly wrong canonical URLs.

1. ~~Settle the branch name and push it~~ (see open questions). The name is
   `develop`; origin does not have it yet, so push before step 7.
2. ~~Make the changes in section 5, then run `npm run test`, `npm run test:e2e`
   and the build.~~ Done 2026-09-07 on `feat/cloudflare-static-export`.
3. ~~Buy the domain at home.pl. The domain only: hosting and DNS packages are
   not needed.~~ Done 2026-09-07: `hannainsurance.pl`, with no SSL or hosting
   package.
4. Cloudflare → Add a site, Free plan, collect the two NS.
5. home.pl → change the delegation to Cloudflare's NS ("własne serwery DNS"
   instead of home.pl's defaults). Wait for the zone to reach Active.
6. Cloudflare → SSL/TLS → **Full (strict)**. Do this before connecting any
   hosting.
7. Create Worker `hanna-prod`, production branch `main`, bind
   `hannainsurance.pl` and `www`, set `NEXT_PUBLIC_SITE_URL` **as a build
   variable** (see item 3 of section 5). Build command `npm run build`, deploy
   command `npx wrangler deploy` - no `--env` flag, the top level of the config
   is production. Leave "Builds for non-production branches" off.

   **Merge `develop` into `main` first.** `main` does not carry `wrangler.jsonc`,
   and a Worker built from a branch without it does not fail with a missing-file
   error: wrangler falls back to scaffolding a project, detects Next.js, answers
   its own prompts with `yes` in a non-interactive build, and runs
   `@opennextjs/cloudflare migrate`. The build then dies on
   `ENOENT .next/standalone/.next/server/pages-manifest.json` - an adapter for
   server-rendered Next failing on a static export, which points at everything
   except the cause. Cost one build on 2026-09-07, on dev, before the branch was
   switched.

   **Deferred on 2026-09-07 by the user**, after dev came up. Everything else in
   section 6 is done.
8. Create Worker `hanna-dev`, production branch `develop`, bind
   `dev.hannainsurance.pl`, set `workers_dev = false`, and set its own
   `NEXT_PUBLIC_SITE_URL` - also a build variable.

   ~~`scripts/serveStatic.mjs` is deleted here.~~ Done 2026-09-07, ahead of this
   step: wrangler is pinned at 4.129.0 in `devDependencies`, `npm start` and the
   Playwright `webServer` run `wrangler dev`, and the stand-in and its three
   tests are gone. Verified against the real runtime: all six routes answer with
   the statuses and content types the imitation produced, including the 404.

   Both Workers need `not_found_handling = "404-page"` in the Wrangler config.
   The default, `"none"`, answers with a bare bodyless 404, while
   `tests/e2e/routes.spec.ts` requires the branded page with status 404. Found
   while moving the end-to-end suite onto static serving.
9. Zero Trust → Access → Applications → Self-hosted on `dev.hannainsurance.pl`.
   Policy: Action `Allow`, selector `Emails`, a list of addresses. Every Access
   application is deny by default.

   **One-time PIN is not automatic - add it first.** This spec's first draft
   called it "the built-in provider", which is no longer true: new Zero Trust
   organizations default to the Cloudflare identity provider, and OTP has to be
   added explicitly under Zero Trust → Integrations → Identity providers → Add
   new identity provider → One-time PIN. The difference matters, because it is
   what decides whether the people you let in need a Cloudflare account. With
   OTP they do not: they enter their address, select **Send login code**, and
   use the PIN, which expires after 10 minutes.

   **Who gets in is decided and entered by the repository owner, not by an
   agent.** The procedure, when the time comes: Zero Trust → Access →
   Applications → the `dev.hannainsurance.pl` application → Policies → the Allow
   rule → selector `Emails` → add the address → Save. Starting with one's own
   address alone is fine. The person needs neither a Cloudflare account nor any
   registration: they enter their email, receive a six-digit code and are let
   in, provided One-time PIN has been added as an identity provider. A policy
   edit takes effect on the next sign-in - no rebuild, no redeploy. The alternative selector `Emails ending in` (a domain suffix) is
   worth using only once there is mail on `@hannainsurance.pl`.
10. Check from a private window: `hannainsurance.pl` opens,
    `dev.hannainsurance.pl` asks for a code by email, and dev's `*.workers.dev`
    does not resolve.

    **Verified for dev on 2026-09-07**, from outside the account: `/` and
    `/sitemap.xml` answer 302 to the Access login page and serve no site
    content, the canonical is `https://dev.hannainsurance.pl` rather than the
    production origin, and a miss returns the branded 404. One caveat found in
    the same pass: `/robots.txt` still answers 200, because Cloudflare's managed
    robots.txt is served at the edge, ahead of Access, and it carries
    `User-agent: * / Allow: /`. Our own `Disallow: /` never reaches the crawler
    on dev. Harmless in practice - a crawler that accepts the invitation still
    hits the login page - but the second layer of the design is masked there.
    Disabling managed robots.txt is a zone-wide setting, so it would also remove
    the AI-crawler restrictions from production, where they are wanted.

---

## 6.1. Automatic deployment

Deployment is automatic: a push to a connected branch triggers the build and the
release with no human in the loop. The mechanism is Workers Builds, whose git
integration is connected when the Worker is created.

Each Worker has its own trigger with its own `branch_includes`. On a commit,
Cloudflare runs the build command (`npm run build`) and then the deploy command
(`npx wrangler deploy` by default). `hanna-prod` listens to `main`, `hanna-dev`
to `develop`; both are connected to the same repository and differ only in their
production branch.

**The "non-production branch builds" option must stay off.** It builds every
other branch and deploys them differently - `wrangler versions upload` instead
of `wrangler deploy` - creating a preview version behind a preview URL. That is
precisely the public entrance past Access that `workers_dev = false` exists to
remove.

What does not become automatic: buying the domain, delegating NS, SSL/TLS and
the Access policy, all of which are one-off manual setup. Workers Builds runs no
tests of its own: a gate on `npm run test` has to be written into the build
command or left to GitHub Actions.

---

## 7. Open questions

- ~~**Branch name.**~~ Settled 2026-09-07: `develop`. The branch already exists
  locally and carries history; the `dev` of this spec's first draft would have
  been a rename with nothing gained. Origin does not have it yet - push before
  step 7.
- ~~**Domain name.**~~ Settled 2026-09-07: `hannainsurance.pl`, bought at
  home.pl the same day. `homeSSL Start` (Cloudflare terminates TLS, and the
  origin needs no certificate) and `Hosting Biznes` (the site lives on Workers,
  Cloudflare serves DNS) were removed from the cart.
- ~~**Email list for Access.**~~ Off the agenda as of 2026-09-07: the repository
  owner maintains the list, following the procedure inside step 9. The step is
  not blocked - one address is enough to start, and the rest are added by a
  policy edit at any time.
- **Mail on the domain.** Not decided, and out of scope. If
  `kontakt@hannainsurance.pl` is ever wanted, receiving is covered by the free
  Cloudflare Email Routing (forwarding only); sending *from* the domain is a
  separate decision, but not a home.pl hosting package.

---

## 8. Risks

- **The static export may collide with the guard tests.** Items 5 and 6 of
  section 5 touch tests that are deliberately strict in this project. If the
  export runs into something insurmountable, the fallback is the Cloudflare
  adapter for Next.js on Workers, which runs the framework whole and needs no
  export. More complex, but it touches no code.
- **NS delegation takes time.** Formally up to 24 hours. Step 7 onwards is
  blocked until the zone is Active.
- **`Full (strict)` is mandatory.** `Flexible` mode, paired with any host that
  serves HTTPS itself, produces an infinite redirect.

---

## 9. Out of scope

- Cookie consent (retire item 27) - a separate feature, `DESIGN-BRIEF.md` 8.5,
  blocked on embedding the Lendi widget.
- The remaining release blockers from `DESIGN-BRIEF.md` 8.3: the real phone
  number and email, photographs, legal texts, the Lendi widget code.
- The nine retire items deferred to the design phase.
- The `sharp` advisories pulled in transitively through `next/image`. Worth
  rechecking after the move to `images: { unoptimized: true }`: the dependency
  may no longer be needed.

---

## 10. Sources

- [Vercel - Deployment Protection](https://vercel.com/docs/deployment-protection)
- [Vercel - Generated URLs](https://vercel.com/docs/deployments/generated-urls)
- [Cloudflare - Preview URLs for Workers](https://developers.cloudflare.com/workers/configuration/previews/)
- [Cloudflare - Static assets on Workers](https://developers.cloudflare.com/workers/static-assets/)
- [Cloudflare - Workers Builds, configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Cloudflare - Workers Builds, build branches](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/)
- [Cloudflare - migrating from Pages: variables and bindings](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
- [Cloudflare - Preview deployments in Pages](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [Cloudflare - Self-hosted public app in Access](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-public-app/)
- [Cloudflare - Zero Trust plans](https://www.cloudflare.com/plans/zero-trust-services/) (Free: up to 50 users, up to 500 Access applications)
