import type { Metadata, Viewport } from 'next';
import { DM_Sans, Manrope, Playfair_Display } from 'next/font/google';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SkipLink } from '@/components/layout/SkipLink';
import { site } from '@/content/site';
import './globals.css';

// The latin-ext subset is required for Polish diacritics
// (a c e l n o s z z). See DESIGN-BRIEF.md section 8.2.
const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.baseUrl),
  title: {
    // The legacy <title> was "Hanna Khudziakova — Ubezpieczenia i finanse".
    // The separator is a hyphen here: Global Constraints ban the em-dash.
    default: `${site.name} - ${site.role}`,
    template: `%s - ${site.name}`,
  },
  description: site.description,
  /*
   * No `alternates` here on purpose. Metadata set on the root layout is
   * inherited by every page that does not override it, so a canonical of "/"
   * declared at this level would make an unmatched URL announce itself as a
   * duplicate of the home page. Each page declares its own.
   */
  /*
   * No `title` or `description` here, against the plan's Step 3. Next falls
   * back to each page's own title and description when openGraph omits them,
   * so declaring them at the root does not add a default: it SHADOWS every
   * page. Verified in the browser: with the plan's version, sharing /about-me
   * produced og:title "Hanna Khudziakova - Ubezpieczenia i finanse" instead of
   * "Poznaj Hannę". type, locale and siteName are genuinely site-wide.
   */
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    siteName: site.name,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  /*
   * Both legacy pages carried <meta name="theme-color">; the plan's Task 13
   * drops it. Value taken from --color-page rather than from the legacy tag:
   * legacy declared #f6f8fb while its own --page was #f7f9fc, so the tag never
   * matched the background it was meant to tint. Porting that verbatim would
   * carry a legacy inconsistency forward.
   */
  themeColor: '#f7f9fc',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The font variables belong on <html>, not <body>: @theme reads them at the
    // root. Verified in Task 2; the plan's Task 4 Step 5 snippet is stale.
    <html
      lang="pl"
      className={`${dmSans.variable} ${playfair.variable} ${manrope.variable}`}
    >
      {/*
        A sticky footer, so a page whose content does not fill the screen still
        puts the footer on the bottom edge instead of leaving a band of page
        background beneath it. The wrapper takes the leftover space; the page's
        own <main> is inside it.

        `dvh`, never `vh`: the brief's regression guard records zero occurrences
        of 100vh precisely because it causes the iOS Safari viewport jump when
        the browser chrome collapses. The dynamic unit tracks that chrome.
      */}
      <body className="flex min-h-dvh flex-col">
        <SkipLink />
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
