import { afterEach, describe, expect, it, vi } from 'vitest';

/*
 * The dev Worker is closed by Cloudflare Access, but Access is a runtime
 * control and robots.txt is a build artefact. If Access is ever removed or
 * misconfigured, the only thing standing between the staging copy and the
 * index is this file, so it fails closed: crawling is invited on exactly one
 * host and refused everywhere else, including on a build that forgot to set
 * NEXT_PUBLIC_SITE_URL at all.
 */

const loadRobots = async (origin: string | undefined) => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  if (origin === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = origin;
  vi.resetModules();
  try {
    const robots = (await import('@/app/robots')).default;
    return robots();
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
};

const rulesOf = (result: Awaited<ReturnType<typeof loadRobots>>) =>
  Array.isArray(result.rules) ? result.rules : [result.rules];

afterEach(() => {
  vi.resetModules();
});

describe('robots.txt', () => {
  it('invites crawlers on the production host', async () => {
    const rules = rulesOf(await loadRobots('https://hannainsurance.pl'));
    expect(rules).toEqual([{ userAgent: '*', allow: '/' }]);
  });

  it('refuses every crawler on the dev host', async () => {
    const rules = rulesOf(await loadRobots('https://dev.hannainsurance.pl'));
    expect(rules).toEqual([{ userAgent: '*', disallow: '/' }]);
  });

  it('refuses every crawler when the build set no origin at all', async () => {
    // A forgotten build variable must not be the difference between a closed
    // environment and an indexed one.
    const rules = rulesOf(await loadRobots(undefined));
    expect(rules).toEqual([{ userAgent: '*', disallow: '/' }]);
  });

  it('does not mistake a lookalike host for production', async () => {
    const rules = rulesOf(await loadRobots('https://hannainsurance.pl.evil.tld'));
    expect(rules).toEqual([{ userAgent: '*', disallow: '/' }]);
  });

  it('points the sitemap at the origin of the build that emitted it', async () => {
    const result = await loadRobots('https://dev.hannainsurance.pl');
    expect(result.sitemap).toBe('https://dev.hannainsurance.pl/sitemap.xml');
  });
});
