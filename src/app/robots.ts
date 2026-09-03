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
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${site.baseUrl}/sitemap.xml`,
  };
}
