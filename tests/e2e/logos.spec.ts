import { expect, test } from '@playwright/test';
import {
  bankPartners,
  insurancePartners,
  marqueePartners,
} from '../../src/content/partners';

test('every logo file resolves with HTTP 200', async ({ request }) => {
  const files = new Set<string>([
    ...marqueePartners,
    ...insurancePartners.map((p) => p.file),
    ...bankPartners.map((p) => p.file),
  ]);

  expect(files.size).toBe(22);

  for (const file of files) {
    const res = await request.get(`/logos/${file}`);
    expect(res.status(), `/logos/${file}`).toBe(200);
  }
});

test('the marquee lives outside the hero section', async ({ page }) => {
  await page.goto('/');
  const heroContainsMarquee = await page.evaluate(() => {
    const hero = document.querySelector('#top');
    const marquee = document.querySelector('[aria-label="Wybrani partnerzy"]');
    return Boolean(hero && marquee && hero.contains(marquee));
  });
  expect(heroContainsMarquee).toBe(false);
});

// The marquee track is w-max, i.e. wider than the viewport by design, so it is
// the one element on the page that can push a horizontal scrollbar onto the
// document if its clipping is ever loosened.
for (const width of [390, 1440]) {
  test(`no horizontal page overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  });
}

test('only the partner grids are exposed to assistive tech', async ({
  page,
}) => {
  await page.goto('/');
  const counts = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')];
    return {
      total: imgs.length,
      exposed: imgs.filter((i) => i.getAttribute('aria-hidden') !== 'true')
        .length,
    };
  });

  // The marquee repeats nine of these logos twice as decoration. If those ever
  // lose aria-hidden, a screen reader reads the partner list three times over.
  expect(counts.exposed).toBe(22);
  expect(counts.total).toBeGreaterThan(counts.exposed);
});

test('the marquee loops without a jump', async ({ page }) => {
  await page.goto('/');
  const mismatch = await page.evaluate(async () => {
    const track = document.querySelector(
      '[aria-label="Wybrani partnerzy"] .animate-marquee'
    ) as HTMLElement;
    track.style.animation = 'none';
    await new Promise((r) => requestAnimationFrame(r));
    const imgs = [...track.querySelectorAll('img')] as HTMLElement[];
    const total = track.getBoundingClientRect().width;
    const period =
      imgs[imgs.length / 2].getBoundingClientRect().left -
      imgs[0].getBoundingClientRect().left;
    return Math.abs(period - total / 2);
  });

  // The keyframe translates by -50%, so half the track must equal exactly one
  // period. Spacing via gap instead of a trailing margin puts these 21px apart
  // (17 gaps across 18 items) and the loop visibly snaps back every cycle.
  expect(mismatch).toBeLessThan(0.5);
});

test('the marquee stops under prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const track = page.locator(
    '[aria-label="Wybrani partnerzy"] .animate-marquee'
  );

  await expect(track).toHaveCSS('animation-name', 'none');
  // The duplicate copy exists only to make the loop seamless.
  const hidden = await page.evaluate(() => {
    const imgs = [
      ...document.querySelectorAll('[aria-label="Wybrani partnerzy"] img'),
    ];
    return imgs.filter((el) => getComputedStyle(el).display === 'none').length;
  });
  expect(hidden).toBe(9);
});

test('the skip link moves focus into the hero, not just the scroll position', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  const focusedId = await page.evaluate(() => document.activeElement?.id);
  expect(focusedId).toBe('top');
});
