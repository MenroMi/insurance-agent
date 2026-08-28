import { expect, test } from '@playwright/test';

test('unknown routes return a branded 404 with a way back', async ({
  page,
}) => {
  const response = await page.goto('/nie-ma-takiej-strony');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('404');

  // Scoped to <main>. The plan's version used .first() on a page-wide locator,
  // and the site header carries a "Strona główna" link that comes first in DOM
  // order, so that assertion passed whether or not the 404 page had a link of
  // its own. A test that cannot fail is worse than no test: docs/LEARNINGS.md.
  await expect(
    page.getByRole('main').getByRole('link', { name: 'Strona główna' })
  ).toBeVisible();
});

test('the 404 page is not indexable and does not hijack navigation', async ({
  page,
}) => {
  await page.goto('/nie-ma-takiej-strony');
  // The shell must still be there: a 404 that loses the nav strands the visitor.
  await expect(
    page.getByRole('navigation', { name: 'Główna nawigacja' })
  ).toBeAttached();
});

test('the privacy policy route exists and is marked as a draft', async ({
  page,
}) => {
  const response = await page.goto('/privacy-policy');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Polityka prywatności'
  );
  await expect(page.getByTestId('legal-draft-notice')).toBeVisible();
});

test('the empty privacy policy is kept out of the index', async ({ page }) => {
  // The status check is not decoration: Next's own 404 page already carries a
  // noindex, so without it this passes against a route that does not exist.
  const response = await page.goto('/privacy-policy');
  expect(response?.status()).toBe(200);
  // An empty legal page must not be indexed, but crawling on to the rest of the
  // site is fine, so the pairing is noindex + follow.
  const robots = page.locator('meta[name="robots"]');
  await expect(robots).toHaveAttribute('content', /noindex/);
  await expect(robots).not.toHaveAttribute('content', /nofollow/);
});

test('the footer link to the privacy policy no longer dead-ends', async ({
  page,
}) => {
  // SiteFooter has shipped this link since Task 4, retire item 26, while the
  // route did not exist. It answered 404 until this task.
  await page.goto('/');
  const link = page
    .getByRole('contentinfo')
    .getByRole('link', { name: 'Polityka prywatności' });
  await expect(link).toHaveAttribute('href', '/privacy-policy');

  await link.click();
  await expect(page).toHaveURL(/\/privacy-policy$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Polityka prywatności'
  );
});
