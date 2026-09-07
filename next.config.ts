import type { NextConfig } from 'next';

/*
 * Static export, because the site is deployed as static assets on Cloudflare
 * Workers. Nothing here needs a server: there are no route handlers, no
 * `use server`, no `revalidate` and no `cookies()`/`headers()` anywhere in
 * src/, so the export loses no behaviour.
 *
 * `images.unoptimized` follows from that: the Next image optimizer is a
 * server. It affects the four partner logos in _components/Partners.tsx, which
 * render small enough that serving the source raster costs nothing visible.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
