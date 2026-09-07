import type { MetadataRoute } from 'next';
import { site } from '@/content/site';

/*
 * No `disallow` for /privacy-policy, against the plan's Step 5.
 *
 * Disallow and noindex do not compose. A disallowed URL is never fetched, so
 * the crawler never reads the noindex meta tag that Task 12 put on that page,
 * and the URL can still end up indexed from an external link, just without a
 * snippet. Exactly one of the two mechanisms should be used, and the meta tag
 * is the one that actually keeps a page out of the index.
 */

/*
 * Required by `output: 'export'`. robots.ts is a route handler rather than a
 * page, and Next 15 refuses to guess whether one is static, even when the
 * function touches nothing dynamic.
 */
export const dynamic = 'force-static';

/*
 * Crawling is invited on exactly one host and refused on every other, which
 * makes an unset or mistyped NEXT_PUBLIC_SITE_URL fail towards a closed dev
 * environment instead of an indexed one. Cloudflare Access already keeps
 * strangers out of dev, but Access is a runtime control and this file is a
 * build artefact: it has to hold on its own if Access is ever switched off.
 */
const invitesCrawlers = () => {
  try {
    return new URL(site.baseUrl).host === site.productionHost;
  } catch {
    return false;
  }
};

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      invitesCrawlers()
        ? { userAgent: '*', allow: '/' }
        : { userAgent: '*', disallow: '/' },
    ],
    sitemap: `${site.baseUrl}/sitemap.xml`,
  };
}
