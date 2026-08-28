import { expect, test } from '@playwright/test';

/*
 * The footer must sit at the bottom of the viewport on pages whose content does
 * not fill the screen, not float up against the last section leaving a band of
 * background below it. Measured before the fix: /privacy-policy left a 344px
 * gap at a 1200px viewport and the 404 left 94px. Long pages were never
 * affected, which is why this went unnoticed until Task 12 added short ones.
 */

const routes = ['/', '/about-me', '/privacy-policy', '/nie-ma-takiej-strony'];

// Deliberately taller than any short page's natural height, so the short routes
// actually exercise the case. 1200 is a common laptop-plus-external-display height.
test.use({ viewport: { width: 1440, height: 1200 } });

for (const route of routes) {
  test(`the footer reaches the bottom of the viewport on ${route}`, async ({
    page,
  }) => {
    await page.goto(route);

    const measured = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      if (!footer) return null;
      const rect = footer.getBoundingClientRect();
      return {
        footerBottom: Math.round(rect.bottom + window.scrollY),
        viewport: window.innerHeight,
      };
    });

    expect(measured).not.toBeNull();
    // On a long page the footer sits far below the fold, which is also correct;
    // the requirement is only that it never stops short of the bottom edge.
    expect(measured!.footerBottom).toBeGreaterThanOrEqual(measured!.viewport);
  });
}

test('a short page still scrolls no further than its content', async ({
  page,
}) => {
  // The sibling failure mode: forcing a full-height shell with a unit that
  // over-measures leaves the page scrollable by a few pixels for no reason.
  await page.goto('/privacy-policy');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
