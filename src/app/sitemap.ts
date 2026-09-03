import type { MetadataRoute } from 'next';
import { site } from '@/content/site';

/*
 * /privacy-policy is deliberately absent: it carries `robots: { index: false }`
 * until it carries real content, and listing a page you are asking not to
 * index contradicts the request. The 404 boundary is not a route and cannot be
 * listed either.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.baseUrl}/`, priority: 1 },
    { url: `${site.baseUrl}/about-me`, priority: 0.8 },
  ];
}
