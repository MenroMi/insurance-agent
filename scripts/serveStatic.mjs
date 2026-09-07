import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

/*
 * Serves the `out/` directory the way Cloudflare Workers static assets do.
 * Backs `npm start` and the Playwright web server, so both local preview and
 * the end-to-end suite exercise what production actually ships.
 *
 * The dev server is not that. `next dev` compiles on demand, resolves routes
 * through the framework router and renders the 404 boundary itself; the
 * deployed site is a directory of files where `/about-me` is `about-me.html`
 * and a miss is `404.html`. Those differences are exactly where a static
 * export breaks, so testing against the dev server would test the one thing we
 * are no longer deploying.
 *
 * STAND-IN, to be deleted. This is an IMITATION of Cloudflare's asset routing,
 * not that routing: the rules below are hardcoded here rather than read from a
 * Worker config, so production can drift away from it silently. The real
 * answer is `wrangler dev`, which runs the actual Workers assets runtime
 * against the actual config, and wrangler becomes a dependency of this project
 * anyway once the Workers are described. Replace this script then; see step 7
 * of docs/superpowers/specs/2026-09-03-environment-split-cloudflare-design.md.
 *
 * It exists only because that config does not exist yet, and because `npx
 * serve@latest out` - what Next suggests - fetches an unpinned package at run
 * time, which this project's exact-version rule rules out.
 *
 * The rules it imitates, all of which the Worker config must match:
 *   - `/about-me` serves `about-me.html`  (clean URLs)
 *   - `/` serves `index.html`
 *   - a miss serves `404.html` with status 404, which requires
 *     `not_found_handling = "404-page"`. The default, `"none"`, answers a bare
 *     404 with no body, and tests/e2e/routes.spec.ts asserts the branded page.
 */

const root = process.env.STATIC_ROOT
  ? path.resolve(process.env.STATIC_ROOT)
  : path.resolve(import.meta.dirname, '../out');
const port = Number(process.env.PORT ?? 3000);

/*
 * This is a foreground server: everything the person who started it learns, it
 * has to print. Silence is indistinguishable from a hang, and the first
 * version of this script was duly reported as one.
 *
 * It also refuses to serve an export that is not there. `next start` used to
 * fail loudly on a missing build; serving nothing but 404s in its place would
 * be a worse answer than an error.
 */
if (!statSync(path.join(root, 'index.html'), { throwIfNoEntry: false })?.isFile()) {
  console.error(
    `No static export at ${root}\nRun \`npm run build\` first, then \`npm start\`.`
  );
  process.exit(1);
}

const types = new Map(
  Object.entries({
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
    '.woff2': 'font/woff2',
    '.ico': 'image/x-icon',
  })
);

const fileFor = (pathname) => {
  const resolved = path.resolve(root, `.${decodeURIComponent(pathname)}`);
  // A request path is attacker-shaped input even in a test server.
  if (resolved !== root && !resolved.startsWith(root + path.sep)) return null;

  const candidates = path.extname(resolved)
    ? [resolved]
    : [path.join(resolved, 'index.html'), `${resolved}.html`];

  return (
    candidates.find((candidate) => {
      try {
        return statSync(candidate).isFile();
      } catch {
        return false;
      }
    }) ?? null
  );
};

const send = (res, status, file) => {
  res.writeHead(status, {
    'content-type': types.get(path.extname(file)) ?? 'application/octet-stream',
  });
  createReadStream(file).pipe(res);
};

const server = createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://127.0.0.1');
  const file = fileFor(pathname);
  if (file) return send(res, 200, file);

  const notFound = path.join(root, '404.html');
  if (statSync(notFound, { throwIfNoEntry: false })?.isFile()) {
    return send(res, 404, notFound);
  }
  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.on('error', (error) => {
  // Node's default for a listen error is an unhandled 'error' event: a stack
  // trace with no advice in it. Leaving a previous server running is the
  // ordinary way to get here.
  console.error(
    error.code === 'EADDRINUSE'
      ? `Port ${port} is already in use. Stop what is on it, or run \`PORT=3001 npm start\`.`
      : `Could not listen on port ${port}: ${error.message}`
  );
  process.exit(1);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Serving ${path.relative(process.cwd(), root) || root} on http://127.0.0.1:${port}`);
  console.log('Static export - `npm run build` again to pick up source changes.');
});
