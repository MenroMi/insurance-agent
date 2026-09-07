import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * The Wrangler config is the one file where a single edited word silently
 * undoes a guarantee proven elsewhere. `workers_dev: true` reopens the public
 * entrance past Cloudflare Access that the whole prod/dev split exists to
 * close; a different `not_found_handling` turns the branded 404 that
 * tests/e2e/routes.spec.ts asserts into a bodyless one; a wrong
 * `assets.directory` ships an empty site. None of those fail any other test,
 * because no other test reads this file.
 */

const stripComments = (jsonc: string) => {
  // A string-aware pass, because `//` inside a quoted value is data. The naive
  // regex version of this eats the second slash of a URL and leaves invalid
  // JSON behind.
  let out = '';
  let inString = false;
  let inLine = false;
  let inBlock = false;

  for (let i = 0; i < jsonc.length; i += 1) {
    const char = jsonc[i];
    const next = jsonc[i + 1];

    if (inLine) {
      if (char === '\n') {
        inLine = false;
        out += char;
      }
      continue;
    }
    if (inBlock) {
      if (char === '*' && next === '/') {
        inBlock = false;
        i += 1;
      }
      continue;
    }
    if (inString) {
      if (char === '\\') {
        out += char + (next ?? '');
        i += 1;
        continue;
      }
      if (char === '"') inString = false;
      out += char;
      continue;
    }
    if (char === '"') {
      inString = true;
      out += char;
      continue;
    }
    if (char === '/' && next === '/') {
      inLine = true;
      i += 1;
      continue;
    }
    if (char === '/' && next === '*') {
      inBlock = true;
      i += 1;
      continue;
    }
    out += char;
  }

  // Trailing commas are legal in JSONC and not in JSON.
  return out.replace(/,(\s*[}\]])/g, '$1');
};

const root = path.resolve(import.meta.dirname, '../..');
const config = JSON.parse(
  stripComments(readFileSync(path.join(root, 'wrangler.jsonc'), 'utf8'))
);
const dev = config.env.dev;

const routePatterns = (worker: Record<string, unknown>) =>
  ((worker.routes ?? []) as { pattern: string }[]).map((r) => r.pattern);

describe('wrangler.jsonc', () => {
  it('serves the directory that next build actually writes', () => {
    // `output: 'export'` writes `out/`. Pointing anywhere else deploys nothing
    // and fails no other test.
    expect(config.assets.directory).toBe('./out');
  });

  it('keeps the branded 404 the e2e suite asserts', () => {
    // The default, "none", answers a bodyless 404 and would break
    // tests/e2e/routes.spec.ts only after deployment, where it is expensive to
    // notice.
    expect(config.assets.not_found_handling).toBe('404-page');
    expect(dev.assets.not_found_handling).toBe('404-page');
  });

  it('removes the workers.dev entrance on both Workers', () => {
    // This is the single setting the whole hosting decision rests on: with it
    // true, dev is reachable past Cloudflare Access and Access cannot help.
    expect(config.workers_dev).toBe(false);
    expect(dev.workers_dev).toBe(false);
  });

  it('leaves dev no preview URLs either', () => {
    // preview_urls follows workers_dev by default, but the default is not the
    // guarantee: stated explicitly, it cannot drift.
    expect(dev.preview_urls).toBe(false);
  });

  it('gives the two environments different names and different hosts', () => {
    expect(config.name).toBe('hanna-prod');
    expect(dev.name).toBe('hanna-dev');
    expect(routePatterns(config)).toEqual([
      'hannainsurance.pl',
      'www.hannainsurance.pl',
    ]);
    expect(routePatterns(dev)).toEqual(['dev.hannainsurance.pl']);
  });

  it('binds every route as a custom domain in the zone', () => {
    for (const worker of [config, dev]) {
      for (const route of worker.routes) {
        expect(route.custom_domain).toBe(true);
      }
    }
  });
});
