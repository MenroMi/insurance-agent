import { expect, test } from '@playwright/test';

const readBar = (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const bar = document.querySelector(
      '[data-testid="journey-progress"]'
    ) as HTMLElement;
    const cs = getComputedStyle(bar);
    return { height: cs.height, transform: cs.transform };
  });

// Retire item 25: the legacy timeline animated `height`, which forces layout on
// every scroll frame. The replacement must move only a transform.
test('the journey progress moves by transform, never by height', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#how-it-works').scrollIntoViewIfNeeded();
  const before = await readBar(page);

  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(600);
  const after = await readBar(page);

  expect(after.height, 'height must stay put').toBe(before.height);
  expect(after.transform, 'transform must advance').not.toBe(before.transform);
  expect(after.transform).toMatch(/^matrix/);
});

test('the journey progress is filled and static under reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#how-it-works').scrollIntoViewIfNeeded();
  const before = await readBar(page);

  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(600);
  const after = await readBar(page);

  expect(after.transform).toBe(before.transform);
  // scaleY is pinned at 1, and Motion writes an identity transform as "none".
  expect(after.transform).toMatch(/^(none|matrix\(1, 0, 0, 1, )/);

  // What the rule actually asks for: the bar is drawn in full, not collapsed.
  const [barBox, railBox] = await Promise.all([
    page.locator('[data-testid="journey-progress"]').boundingBox(),
    page.locator('#how-it-works .bg-line').first().boundingBox(),
  ]);
  expect(barBox!.height).toBeCloseTo(railBox!.height, 0);
});

test('the benefits strip carries the four figures', async ({ page }) => {
  await page.goto('/');
  for (const figure of ['17', '9', '1', '0 zł']) {
    await expect(
      page.locator('#how-it-works strong', { hasText: figure }).first()
    ).toBeVisible();
  }
});
