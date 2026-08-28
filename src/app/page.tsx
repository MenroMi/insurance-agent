import type { Metadata } from 'next';
import { Consultation } from '@/app/_components/Consultation';
import { Hero } from '@/app/_components/Hero';
import { Journey } from '@/app/_components/Journey';
import { PartnerMarquee } from '@/app/_components/PartnerMarquee';
import { Partners } from '@/app/_components/Partners';
import { Services } from '@/app/_components/Services';
import { buildStructuredData } from '@/lib/structuredData';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function HomePage() {
  // Null while the contact details are placeholders. See lib/structuredData.ts.
  const structuredData = buildStructuredData();

  return (
    <main>
      {structuredData && (
        <script
          type="application/ld+json"
          // The payload is built from typed content modules, never from user
          // input, and JSON.stringify escapes it. There is no other way to emit
          // a JSON-LD block in React.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <Hero />
      <PartnerMarquee />
      <Journey />
      <Services />
      <Partners />
      <Consultation />
    </main>
  );
}
