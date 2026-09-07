import { afterEach, describe, expect, it, vi } from 'vitest';

/*
 * `site.baseUrl` stops being a constant and starts coming from the build
 * environment, because prod and dev are two Cloudflare Workers built from one
 * repository and must not claim the same canonical origin.
 *
 * The variable is read at BUILD time, not at run time: `next build` inlines
 * every `NEXT_PUBLIC_*` value, and under `output: 'export'` no run time is
 * left. These tests therefore reload the module rather than expecting it to
 * react to a later change.
 */

const loadSite = async () => (await import('@/content/site')).site;

const withSiteUrl = async (value: string | undefined) => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  if (value === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = value;
  vi.resetModules();
  try {
    return await loadSite();
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
};

afterEach(() => {
  vi.resetModules();
});

describe('site.baseUrl', () => {
  it('takes the canonical origin from NEXT_PUBLIC_SITE_URL', async () => {
    const site = await withSiteUrl('https://dev.hannainsurance.pl');
    expect(site.baseUrl).toBe('https://dev.hannainsurance.pl');
  });

  it('falls back to the placeholder domain when the variable is unset', async () => {
    // Keeps local development, `npm run test` and any build that forgets the
    // variable on the placeholder rather than on someone else's domain. The
    // `.invalid` TLD is also what gates structured data in src/lib.
    const site = await withSiteUrl(undefined);
    expect(site.baseUrl).toBe('https://example.invalid');
  });

  it('drops a trailing slash so joined paths never double it', async () => {
    // sitemap.ts writes `${site.baseUrl}/`. A value pasted from a browser
    // address bar carries the slash, and the sitemap would then advertise
    // https://hannainsurance.pl// as the home page.
    const site = await withSiteUrl('https://hannainsurance.pl/');
    expect(site.baseUrl).toBe('https://hannainsurance.pl');
  });
});
