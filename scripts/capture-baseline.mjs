/**
 * Captures the legacy site's visual baseline for the Task 15 parity check.
 *
 * A plain `playwright screenshot` call is NOT enough here, and produced a
 * baseline with roughly 60% of the page blank. Three things must line up:
 *
 * 1. Reduced motion must be emulated. The legacy `styles.css` hides every
 *    `.reveal` element at `opacity: 0` and only clears it from an
 *    IntersectionObserver callback. A screenshot taken on load catches
 *    nothing revealed. The stylesheet's `@media (prefers-reduced-motion:
 *    reduce)` block forces those elements visible, so emulating the
 *    preference is what makes the page capturable at all.
 * 2. The page must be scrolled to the bottom and back. The partner logos use
 *    `loading="lazy"`, so anything below the first viewport is never fetched
 *    for an instant capture, leaving empty cells in both logo grids.
 * 3. Every image must be confirmed complete before capturing, rather than
 *    trusting a fixed timeout.
 *
 * Usage: node scripts/capture-baseline.mjs [outputDir]
 * Requires the legacy site to be served on http://127.0.0.1:8099
 */

import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const BASE = "http://127.0.0.1:8099";
const OUT = process.argv[2] ?? "/tmp/hanna-baseline";

const TARGETS = [
  { name: "legacy-home", path: "/index.html", width: 1440, height: 900 },
  { name: "legacy-about", path: "/poznaj-hanne.html", width: 1440, height: 900 },
  { name: "legacy-home-mobile", path: "/index.html", width: 390, height: 844 },
];

/** Scrolls the full height in viewport-sized steps, then returns to the top. */
async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight;
    const total = document.body.scrollHeight;
    for (let y = 0; y < total; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 200));
  });
}

/** Resolves once every <img> reports complete, or throws after `timeout` ms. */
async function waitForImages(page, timeout = 15000) {
  const deadline = Date.now() + timeout;
  for (;;) {
    const pending = await page.evaluate(() =>
      [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).length,
    );
    if (pending === 0) return;
    if (Date.now() > deadline) {
      throw new Error(`${pending} image(s) never finished loading`);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const results = [];

  for (const t of TARGETS) {
    const context = await browser.newContext({
      viewport: { width: t.width, height: t.height },
      reducedMotion: "reduce",
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    await page.goto(`${BASE}${t.path}`, { waitUntil: "networkidle" });
    await scrollThrough(page);
    await waitForImages(page);

    const file = `${OUT}/${t.name}.png`;
    await page.screenshot({ path: file, fullPage: true });

    const stats = await page.evaluate(() => ({
      images: document.images.length,
      hiddenReveals: [...document.querySelectorAll(".reveal")].filter(
        (el) => Number(getComputedStyle(el).opacity) < 0.9,
      ).length,
      totalReveals: document.querySelectorAll(".reveal").length,
    }));

    results.push({ ...t, file, ...stats });
    await context.close();
  }

  await browser.close();

  console.log("Baseline captured:\n");
  let failed = false;
  for (const r of results) {
    const ok = r.hiddenReveals === 0;
    if (!ok) failed = true;
    console.log(
      `  ${ok ? "OK  " : "FAIL"} ${r.name.padEnd(20)} ` +
        `${String(r.width).padStart(4)}px  ` +
        `images=${r.images}  ` +
        `reveals visible=${r.totalReveals - r.hiddenReveals}/${r.totalReveals}`,
    );
  }

  if (failed) {
    console.error(
      "\nSome .reveal elements are still hidden. The baseline would understate " +
        "the page and must not be used for the Task 15 parity check.",
    );
    process.exit(1);
  }
  console.log(`\nWrote ${results.length} screenshots to ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
