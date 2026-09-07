import { defineConfig } from '@playwright/test';

/*
 * The suite runs against the static export, not against `next dev`, because
 * the static export is what Cloudflare Workers serve. scripts/serveStatic.mjs
 * reproduces the asset routing production uses.
 *
 * `npm run build` runs as part of the web server command, so a stale `out/`
 * cannot quietly pass a run. Locally, `reuseExistingServer` still lets a
 * server already listening on the port be reused.
 */
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://127.0.0.1:3000' },
  webServer: {
    command: 'npm run build && node scripts/serveStatic.mjs',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
