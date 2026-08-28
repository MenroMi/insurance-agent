import { expect, test } from '@playwright/test';

test('the home page carries title, description, canonical and OG tags', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Hanna Khudziakova/);

  const description = page.locator('meta[name="description"]');
  await expect(description).toHaveAttribute('content', /ubezpiecze/i);

  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    'content',
    'website'
  );
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
    'content',
    'pl_PL'
  );
});

test('each page shares under its own title and description', async ({
  page,
}) => {
  // The plan set openGraph.title and openGraph.description on the ROOT layout.
  // Next falls back to the page's own values when openGraph omits them, so
  // declaring them at the root does not provide a default, it shadows every
  // page: /about-me shared as "Hanna Khudziakova - Ubezpieczenia i finanse".
  await page.goto('/about-me');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    /Poznaj Hannę/
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    'content',
    /sposób pracy/
  );

  // The site-wide fields stay site-wide.
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
    'content',
    'Hanna Khudziakova'
  );
});

test('canonical URLs are absolute once metadataBase is set', async ({
  page,
}) => {
  // Tasks 11 and 12 shipped `alternates: { canonical: '/about-me' }` with no
  // metadataBase, so the tag rendered as a relative href. metadataBase is what
  // turns it absolute; a relative canonical is valid HTML but weak SEO.
  for (const route of ['/', '/about-me', '/privacy-policy']) {
    await page.goto(route);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /^https?:\/\//
    );
  }
});

test('the 404 does not inherit the home page canonical', async ({ page }) => {
  // A canonical set on the ROOT layout is inherited by every page that does not
  // override it, so an unmatched URL would declare itself a duplicate of the
  // home page. Canonicals belong on the pages, not on the shell.
  await page.goto('/nie-ma-takiej-strony');
  const canonical = page.locator('link[rel="canonical"]');
  const count = await canonical.count();
  if (count > 0) {
    await expect(canonical).not.toHaveAttribute('href', /\/$/);
  }
  expect(count).toBe(0);
});

test('the legacy theme-color survives the migration', async ({ page }) => {
  // Both legacy pages carried <meta name="theme-color">. The plan's metadata
  // block drops it silently; it is the browser UI tint on mobile.
  await page.goto('/');
  await expect(page.locator('meta[name="theme-color"]')).toHaveCount(1);
});

test('a favicon is served', async ({ request }) => {
  const res = await request.get('/icon.svg');
  expect(res.status()).toBe(200);
});

test('sitemap and robots are generated', async ({ request }) => {
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain('/about-me');

  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Sitemap:');
});

test('the noindex page is crawlable but absent from the sitemap', async ({
  request,
}) => {
  // Disallow and noindex do not compose: a disallowed URL is never fetched, so
  // the crawler never reads the noindex and the page can still be indexed from
  // an external link, just without a snippet. Task 12 chose the meta tag, so
  // robots.txt must leave the path crawlable.
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).not.toContain('privacy-policy');

  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('privacy-policy');
});

test('no structured data is published while the contact details are placeholders', async ({
  page,
}) => {
  // Section 7 lists structured data as an SEO gap, and the plan's steps omit it
  // entirely. It is implemented but gated: publishing a LocalBusiness record
  // carrying +48 000 000 000 and example.invalid would be worse than none.
  await page.goto('/');
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(
    0
  );
});
