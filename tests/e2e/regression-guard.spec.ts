import { expect, test } from '@playwright/test';

/*
 * The brief's 14-row regression guard, as executable assertions, so the
 * deferred design phase cannot silently undo any of it.
 *
 * Two rows are NOT asserted here, on purpose:
 *
 * - "No 100vh bug". getComputedStyle resolves min-height to the used pixel
 *   value, so the plan's `s.minHeight === "100vh"` can never be true and the
 *   assertion could not fail. Measured: a probe element with min-height:100vh
 *   reports "900px" at a 900px viewport. The row is covered at source level
 *   instead, in tests/unit/site-invariants.test.tsx, which bans the static
 *   viewport unit and Tailwind's `screen` scale in any className.
 * - "No dead commented-out code" is also a source-level property and lives in
 *   the same file.
 *
 * Rows already covered by a section suite are still asserted here when the
 * check is cheap: this file is the net, not the only line of defence.
 */

// Measurements below are width-dependent, so the viewport is pinned rather
// than left at Playwright's 1280x720 default.
test.use({ viewport: { width: 1440, height: 900 } });

const ROUTES = [
  '/',
  '/about-me',
  '/privacy-policy',
  '/nie-ma-takiej-strony',
] as const;

for (const route of ROUTES) {
  test(`${route}: lang is pl`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
  });

  test(`${route}: semantic landmarks present, no div soup`, async ({
    page,
  }) => {
    await page.goto(route);
    await expect(page.locator('header')).toHaveCount(1);
    await expect(page.locator('nav')).not.toHaveCount(0);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);
  });

  test(`${route}: zero em-dashes and en-dashes in visible text`, async ({
    page,
  }) => {
    await page.goto(route);
    const text = await page.locator('body').innerText();
    const offenders = text
      .split('\n')
      .filter((line) => line.includes('—') || line.includes('–'));
    expect(offenders).toEqual([]);
  });

  test(`${route}: no inline style attributes authored in markup`, async ({
    page,
  }) => {
    await page.goto(route);
    // Two element kinds are framework-controlled and excluded: the <div>
    // wrappers Motion animates, and <img>, because next/image emits its own
    // sizing and `color: transparent` inline. The brief's row is about markup
    // an author wrote, not about what the framework renders. The plan's version
    // checked img[style] and would have failed on every optimised logo, which
    // is a sign that suite was never run against the app.
    const offenders = await page.evaluate(() =>
      [
        ...document.querySelectorAll(
          'a[style], p[style], h1[style], h2[style], h3[style], ' +
            'section[style], article[style], li[style], ul[style], ' +
            'main[style], header[style], footer[style], nav[style], button[style]'
        ),
      ].map((el) => el.tagName.toLowerCase())
    );
    expect(offenders).toEqual([]);
  });

  test(`${route}: no dead links`, async ({ page }) => {
    await page.goto(route);
    expect(await page.locator('a[href="#"], a[href=""]').count()).toBe(0);
  });

  test(`${route}: every image has non-empty alt or is aria-hidden`, async ({
    page,
  }) => {
    await page.goto(route);
    const bad = await page.evaluate(() =>
      [...document.images]
        .filter(
          (img) =>
            img.getAttribute('aria-hidden') !== 'true' &&
            !(img.getAttribute('alt') ?? '').trim()
        )
        .map((img) => img.currentSrc || img.src)
    );
    expect(bad).toEqual([]);
  });

  test(`${route}: no image fails to load`, async ({ page }) => {
    await page.goto(route);
    // Every logo below the fold is lazily loaded, so it must be scrolled into
    // view before it is fetched at all. The page height grows as sections
    // render, so re-read it each step rather than sampling it once.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 300) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 80));
      }
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForLoadState('networkidle');

    // naturalWidth is the load signal, NOT `complete`. Measured on the marquee
    // logos: naturalWidth is 300 while complete is still false, because the
    // strip is duplicated and animated, so the load event for the second copy
    // has not fired at the moment of measurement even though the bitmap is
    // decoded and painting. The plan's `!img.complete || naturalWidth === 0`
    // reports 29 of 40 images as broken on a page where every logo is visible.
    //
    // Polled rather than sampled: a fetch triggered by the last scroll step can
    // still be in flight, and a one-shot read turns that into a flaky failure.
    await expect
      .poll(
        async () =>
          page.evaluate(() =>
            [...document.images]
              .filter((img) => img.naturalWidth === 0)
              .map((img) => img.currentSrc || img.src)
          ),
        { message: 'images that never decoded' }
      )
      .toEqual([]);
  });

  test(`${route}: z-index stays on a sane scale`, async ({ page }) => {
    await page.goto(route);
    // The brief records a max of 80, on the sticky header. The skip link goes
    // to 100 while focused, so 100 is the ceiling rather than 80.
    const max = await page.evaluate(() =>
      Math.max(
        0,
        ...[...document.querySelectorAll('*')]
          .map((el) => Number.parseInt(getComputedStyle(el).zIndex, 10))
          .filter((n) => Number.isFinite(n))
      )
    );
    expect(max).toBeLessThanOrEqual(100);
  });

  test(`${route}: no pure black anywhere it can be seen`, async ({ page }) => {
    await page.goto(route);
    const offenders = await page.evaluate(() => {
      const out = new Set<string>();
      for (const el of document.body.querySelectorAll('*')) {
        // Elements with no box render nothing, and <head> children inherit the
        // user-agent black before body sets the ink colour. Both are noise.
        if (!(el as HTMLElement).offsetParent && el.tagName !== 'BODY')
          continue;
        const s = getComputedStyle(el);
        if (s.color === 'rgb(0, 0, 0)') out.add(`color:${el.tagName}`);
        if (s.backgroundColor === 'rgb(0, 0, 0)') out.add(`bg:${el.tagName}`);
      }
      return [...out];
    });
    expect(offenders).toEqual([]);
  });

  test(`${route}: shadows are tinted with the page hue, never black`, async ({
    page,
  }) => {
    await page.goto(route);
    const offenders = await page.evaluate(() => {
      const out = new Set<string>();
      for (const el of document.querySelectorAll('*')) {
        const shadow = getComputedStyle(el).boxShadow;
        if (!shadow || shadow === 'none') continue;
        // Tailwind seeds a fully transparent placeholder shadow on many
        // elements; only a visible black one is a violation.
        for (const match of shadow.matchAll(
          /rgba?\(0,\s*0,\s*0(?:,\s*([\d.]+))?\)/g
        )) {
          const alpha = match[1] === undefined ? 1 : Number(match[1]);
          if (alpha > 0) out.add(`${el.tagName}:${shadow.slice(0, 40)}`);
        }
      }
      return [...out];
    });
    expect(offenders).toEqual([]);
  });

  test(`${route}: the content container stays constrained`, async ({
    page,
  }) => {
    await page.goto(route);
    // Brief: --container 1180px via min(). At a 1440px viewport the content
    // stops there rather than running to the full width.
    //
    // The marquee track is deliberately about twice the page wide, because the
    // logo strip is rendered twice so the loop has no seam. It sits inside an
    // overflow-clip ancestor and is never visible past the edge, so anything
    // under a clipping ancestor is excluded rather than counted as a breakout.
    // Asserted on text-bearing elements, not on layout wrappers. Sections are
    // full-bleed BY DESIGN, because each one paints its own background band;
    // the constrained thing is the content inside them. Checking every element
    // reports MAIN:1440 and SECTION:1440, which are correct, not violations.
    const offenders = await page.evaluate(() =>
      [
        ...document.querySelectorAll(
          'main p, main h1, main h2, main h3, main li'
        ),
      ]
        .filter((el) => Math.round(el.getBoundingClientRect().width) > 1180)
        .map(
          (el) =>
            `${el.tagName}:${Math.round(el.getBoundingClientRect().width)}`
        )
    );
    expect(offenders).toEqual([]);
  });

  test(`${route}: keyboard focus is visible on the first tab stop`, async ({
    page,
  }) => {
    await page.goto(route);
    await page.keyboard.press('Tab');
    const outline = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      const s = getComputedStyle(el);
      return { width: s.outlineWidth, style: s.outlineStyle };
    });
    expect(outline?.style).not.toBe('none');
    expect(outline?.width).not.toBe('0px');
  });
}

test('the nav toggle exposes its state', async ({ page }) => {
  // Legacy kept aria-expanded in sync from script.js; the React header must not
  // regress to a button that opens a menu without announcing it.
  await page.setViewportSize({ width: 480, height: 900 });
  await page.goto('/');

  const toggle = page.locator('header button[aria-expanded]');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('service card CTAs stay bottom-aligned whatever the copy length', async ({
  page,
}) => {
  await page.goto('/');
  // `mt-auto` resolves to 0px when the cards happen to be equal height, so the
  // value proves nothing. The invariant is positional: every CTA sits the same
  // distance above its own card's bottom edge, however long the body text.
  const gaps = await page.evaluate(() =>
    [...document.querySelectorAll('#services article')].map((card) => {
      const cta = card.querySelector('a');
      if (!cta) return -1;
      return Math.round(
        card.getBoundingClientRect().bottom - cta.getBoundingClientRect().bottom
      );
    })
  );
  expect(gaps).not.toContain(-1);
  expect(new Set(gaps).size).toBe(1);
});

test('the copy carries no filler and no placeholder prose', async ({
  page,
}) => {
  await page.goto('/');
  const text = (await page.locator('body').innerText()).toLowerCase();
  for (const filler of [
    'lorem ipsum',
    'elevate',
    'seamless',
    'unlock',
    'empower',
    'cutting-edge',
    'game-changing',
  ]) {
    expect(text, filler).not.toContain(filler);
  }
});

test('public anchor targets all exist on the home page', async ({ page }) => {
  await page.goto('/');
  for (const id of ['top', 'how-it-works', 'services', 'partners', 'contact']) {
    await expect(page.locator(`#${id}`), `#${id}`).toHaveCount(1);
  }
});

test('nav labels are unchanged', async ({ page }) => {
  await page.goto('/');
  const nav = page.locator('header nav');
  for (const label of [
    'Strona główna',
    'Poznaj Hannę',
    'Usługi',
    'Partnerzy',
    'Bezpłatna konsultacja',
  ]) {
    await expect(nav.getByRole('link', { name: label })).toHaveCount(1);
  }
});

test('current page is marked in the nav', async ({ page }) => {
  await page.goto('/about-me');
  await expect(page.locator('header nav a[aria-current="page"]')).toHaveCount(
    1
  );
});

test('at most one marquee on the page', async ({ page }) => {
  await page.goto('/');
  const marquees = await page.evaluate(
    () =>
      [...document.querySelectorAll('*')].filter((el) =>
        getComputedStyle(el).animationName.includes('marquee')
      ).length
  );
  expect(marquees).toBeLessThanOrEqual(1);
});

test('no animation targets a non-GPU property', async ({ page }) => {
  await page.goto('/');
  const offenders = await page.evaluate(() => {
    // `all` is on the list: it is the usual way a layout property starts being
    // animated by accident, and the plan's version omitted it.
    const banned = [
      'all',
      'height',
      'width',
      'top',
      'left',
      'margin',
      'padding',
    ];
    const out: string[] = [];
    for (const el of document.querySelectorAll('*')) {
      const s = getComputedStyle(el);
      // `transition-property` computes to `all` on EVERY element by default, so
      // without this duration filter the check reports the whole document,
      // including <head> children. Only an element that actually transitions
      // can animate a layout property.
      if (s.transitionDuration.split(',').every((d) => parseFloat(d) === 0)) {
        continue;
      }
      for (const p of s.transitionProperty.split(',').map((v) => v.trim())) {
        if (banned.includes(p)) out.push(`${el.tagName}:${p}`);
      }
    }
    return out;
  });
  expect(offenders).toEqual([]);
});

test('reduced motion keeps content visible', async ({ browser }) => {
  // The marquee half of this is covered by logos.spec.ts, which asserts the
  // animation is actually stopped. This one is about content not disappearing.
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const opacity = await page
    .getByRole('heading', { level: 1 })
    .evaluate((el) => getComputedStyle(el).opacity);
  expect(Number(opacity)).toBeGreaterThan(0.9);

  await context.close();
});

test('content is visible with JavaScript disabled', async ({ browser }) => {
  // The single most valuable assertion in this file: it is the one that would
  // have caught the legacy `.reveal { opacity: 0 }` trap, where every section
  // below the fold stayed invisible without JavaScript.
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  for (const route of ['/', '/about-me']) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }

  await page.goto('/');
  await expect(page.getByText('Wybierz temat')).toBeVisible();
  await expect(page.locator('#partners')).toBeVisible();

  await context.close();
});
