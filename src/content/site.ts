/*
 * `baseUrl` is per-environment: prod and dev are two Cloudflare Workers built
 * from this one repository, and a dev build that declared the production
 * origin would put dev URLs into canonical, Open Graph and the sitemap.
 *
 * `NEXT_PUBLIC_SITE_URL` is read at BUILD time. `next build` inlines every
 * `NEXT_PUBLIC_*` value into the output, and with `output: 'export'` there is
 * no run time left to read anything later. It has to be set as a build
 * variable in Workers Builds; `vars` in the Wrangler config never reach it.
 *
 * Unset falls back to the placeholder, so local work and CI keep the
 * behaviour they had while the domain was unknown. The `.invalid` TLD is load
 * bearing: src/lib/structuredData.ts refuses to publish a business record
 * while the origin is still a placeholder.
 */
const PLACEHOLDER_ORIGIN = 'https://example.invalid';

const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || PLACEHOLDER_ORIGIN
).replace(/\/+$/, '');

/*
 * The one host that is allowed to invite crawlers. It is a fact about the
 * project rather than a property of the environment, so it stays a constant
 * while `baseUrl` varies. src/app/robots.ts compares the two, which makes an
 * unset or mistyped `NEXT_PUBLIC_SITE_URL` fail towards `disallow: /` instead
 * of towards an indexed dev site.
 */
const productionHost = 'hannainsurance.pl';

export const site = {
  name: 'Hanna Khudziakova',
  role: 'Ubezpieczenia i finanse',
  description:
    'Hanna Khudziakova, konsultacje w zakresie ubezpieczeń i finansowania. Współpraca z 17 firmami ubezpieczeniowymi oraz 9 bankami.',
  baseUrl,
  productionHost,
} as const;
