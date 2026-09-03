import { expect, test } from '@playwright/test';

// The unit test proves the markup. These prove the styling, which Tailwind v4
// drops silently when a value is off its dynamic scales: no build error, no
// failing unit test, just an unstyled element. Same reasoning as tokens.spec.ts.

test('the consultation panel keeps its dark treatment', async ({ page }) => {
  await page.goto('/');
  // The panel is the div that holds the headline; `#contact div` first would
  // match the Reveal wrapper instead.
  const panel = page.locator('#contact div:has(> h2)');

  await expect
    .poll(
      async () =>
        panel.evaluate((el) => {
          const s = getComputedStyle(el);
          return {
            // p-7.5 / sm:p-12, and the gold radial wash over --color-primary-dark
            gradient: s.backgroundImage.startsWith('radial-gradient'),
            base: s.backgroundColor,
          };
        }),
      { message: 'panel background' }
    )
    .toEqual({ gradient: true, base: 'rgb(23, 61, 96)' });

  // text-consult-body: a missing utility would leave this inheriting white.
  await expect(page.getByText(/^Wypełnij formularz konsultacyjny/)).toHaveCSS(
    'color',
    'rgb(191, 208, 222)'
  );
});

test('the contact links carry the 13px legacy padding', async ({ page }) => {
  await page.goto('/');
  // py-3.25 is off Tailwind's whole-number scale; styles.css line 617 says 13px.
  await expect(page.locator('#contact a[href^="tel:"]')).toHaveCSS(
    'padding-top',
    '13px'
  );
});

test('the Lendi slot reserves the widget height and stays inert', async ({
  page,
}) => {
  await page.goto('/');
  const slot = page.locator('[data-testid="lendi-slot"]');

  await expect(slot).toBeVisible();
  // min-h-105 is 420px; without it the dashed box collapses to its text.
  expect(
    await slot.evaluate((el) => el.getBoundingClientRect().height)
  ).toBeGreaterThanOrEqual(420);
  // Retire item 1: no rebuilt fake form, so nothing here is focusable.
  await expect(
    slot.locator('button, input, select, textarea, a, [tabindex]')
  ).toHaveCount(0);
});

test('the shell is two columns on desktop and one on mobile', async ({
  page,
}) => {
  await page.goto('/');
  const shell = page.locator('#contact > div > div').first();

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect
    .poll(async () =>
      shell.evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length
      )
    )
    .toBe(2);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(async () =>
      shell.evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length
      )
    )
    .toBe(1);
});
