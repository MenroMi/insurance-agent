import { expect, test } from '@playwright/test';

test("theme tokens resolve to the brief's values", async ({ page }) => {
  await page.goto('/');
  const body = page.locator('body');

  await expect(body).toHaveCSS('background-color', 'rgb(247, 249, 252)'); // --color-page
  await expect(body).toHaveCSS('color', 'rgb(29, 42, 57)'); // --color-ink
});

// Tailwind v4 resolves many utilities from dynamic scales. When a value is NOT
// on a dynamic scale, Tailwind emits no rule at all: no build error, no failing
// unit test, just silently missing styling. The plan leans on unusual values
// (mt-17, gap-10.5, pt-25, py-26, p-9.5, opacity-36, z-80, z-100), so probe one
// representative per family before writing 2000 lines that depend on them.
test('unusual utility values actually emit CSS', async ({ page }) => {
  await page.goto('/');
  const probes = [
    { cls: 'mt-17', prop: 'marginTop', expect: '68px' },
    { cls: 'gap-10.5', prop: 'rowGap', expect: '42px' },
    { cls: 'py-26', prop: 'paddingTop', expect: '104px' },
    { cls: 'p-9.5', prop: 'paddingTop', expect: '38px' },
    { cls: 'opacity-36', prop: 'opacity', expect: '0.36' },
    { cls: 'z-80', prop: 'zIndex', expect: '80' },
  ];

  // Polled, not read once: in dev the server compiles on demand, so a cold
  // `goto` can resolve before the stylesheet is applied and every probe would
  // then report the unstyled value. That produced a spurious failure once.
  await expect
    .poll(
      async () => {
        const results = await page.evaluate((list) => {
          return list.map(({ cls, prop }) => {
            const el = document.createElement('div');
            el.className = cls;
            el.style.position = 'relative';
            document.body.append(el);
            const value = getComputedStyle(el)[prop as never] as string;
            el.remove();
            return { cls, value };
          });
        }, probes);

        return results
          .filter((r, i) => r.value !== probes[i].expect)
          .map(
            (r, i) => `${r.cls}: got ${r.value}, expected ${probes[i].expect}`
          );
      },
      { message: 'utilities that emitted no CSS' }
    )
    .toEqual([]);
});

test('focus-visible produces a visible outline', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const a = document.createElement('a');
    a.href = '#top';
    a.id = 'probe';
    a.textContent = 'probe';
    // Prepended, not appended: since Task 4 the shell puts a skip link, a
    // header and a footer on the page, so "append + one Tab" would focus the
    // skip link instead. First child is the first tab stop, whatever follows.
    document.body.prepend(a);
  });
  await page.keyboard.press('Tab');
  const outlineWidth = await page
    .locator('#probe')
    .evaluate((el) => getComputedStyle(el).outlineWidth);
  expect(outlineWidth).toBe('2px');
});
