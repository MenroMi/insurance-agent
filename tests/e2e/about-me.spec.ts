import { expect, test } from '@playwright/test';

test('the advisor page renders its heading and philosophy', async ({
  page,
}) => {
  await page.goto('/about-me');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'dobra decyzja finansowa'
  );
  await expect(page.getByText('Moja filozofia pracy')).toBeVisible();
});

test('the advisor page has no dead links', async ({ page }) => {
  await page.goto('/about-me');
  const deadLinks = await page.locator('a[href="#"]').count();
  expect(deadLinks).toBe(0);
});

test('the four how-I-work blocks render', async ({ page }) => {
  await page.goto('/about-me');
  await expect(page.getByRole('article')).toHaveCount(4);
});

// The unit test proves the markup. These prove the styling, which Tailwind v4
// drops silently when a value is off its dynamic scales: no build error, no
// failing unit test, just an unstyled element. Same reasoning as
// consultation.spec.ts, which is the only thing that caught the Task 10 defect.

test('the featured how-I-work block keeps its radial wash over the page tint', async ({
  page,
}) => {
  await page.goto('/about-me');
  // styles.css line 1080 sets the gradient and the base colour in one
  // `background` shorthand. A single bg-[...] carrying both layers emits no
  // rule at all, so assert on the painted result, not on the class list.
  const featured = page.getByRole('article').first();

  await expect
    .poll(
      async () =>
        featured.evaluate((el) => {
          const s = getComputedStyle(el);
          return {
            gradient: s.backgroundImage.startsWith('radial-gradient'),
            base: s.backgroundColor,
          };
        }),
      { message: 'featured block background' }
    )
    .toEqual({ gradient: true, base: 'rgb(247, 249, 252)' });
});

test('the closing CTA panel keeps its dark treatment and gold eyebrow', async ({
  page,
}) => {
  await page.goto('/about-me');
  // The panel's direct children are the copy column and the CTA link, so the
  // h2 sits one level deeper; `div:has(> h2)` would match the column instead.
  const panel = page.locator('div:has(> a[href="/#contact"])');

  // bg-primary-dark; a missing utility would leave the panel transparent and
  // the white copy unreadable on the page tint.
  await expect(panel).toHaveCSS('background-color', 'rgb(23, 61, 96)');
  // styles.css line 1097: .about-contact-cta .eyebrow { color: var(--gold-soft) }
  // Scoped to the <p>: retire item 4 gives the CTA link the same label, so a
  // plain text locator would match two elements and fail strict mode.
  await expect(panel.locator('p:text-is("Bezpłatna konsultacja")')).toHaveCSS(
    'color',
    'rgb(243, 229, 200)'
  );
});

test('the header marks the advisor page as the current one', async ({
  page,
}) => {
  await page.goto('/about-me');
  await expect(
    page
      .getByRole('navigation', { name: 'Główna nawigacja' })
      .getByRole('link', {
        name: 'Poznaj Hannę',
      })
  ).toHaveAttribute('aria-current', 'page');
});
