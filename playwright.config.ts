import { defineConfig } from '@playwright/test';

/*
 * The suite runs against `wrangler dev`, which executes the real Cloudflare
 * Workers assets runtime over the real wrangler.jsonc - the same config the
 * deployment uses. Clean URLs and the 404 mapping are therefore the deployed
 * behaviour rather than a local approximation of it.
 *
 * This replaced a hand-written static server. That server got the rules right,
 * but it hardcoded them: nothing tied it to the config production reads, so the
 * two could drift apart silently.
 *
 * `npm run build` runs first, so a stale `out/` cannot quietly pass a run.
 * WRANGLER_SEND_METRICS keeps wrangler from asking about telemetry on a first
 * run, which would block a non-interactive start.
 */
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://127.0.0.1:3000' },
  webServer: {
    command: 'npm run build && npx wrangler dev --port 3000',
    url: 'http://127.0.0.1:3000',
    env: { WRANGLER_SEND_METRICS: 'false' },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
