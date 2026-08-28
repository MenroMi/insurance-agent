import type { Metadata } from 'next';
import { DM_Sans, Manrope, Playfair_Display } from 'next/font/google';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SkipLink } from '@/components/layout/SkipLink';
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
  title: 'Hanna Khudziakova',
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
