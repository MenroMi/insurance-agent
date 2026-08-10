import { Consultation } from '@/app/_components/Consultation';
import { Hero } from '@/app/_components/Hero';
import { Journey } from '@/app/_components/Journey';
import { PartnerMarquee } from '@/app/_components/PartnerMarquee';
import { Partners } from '@/app/_components/Partners';
import { Services } from '@/app/_components/Services';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <PartnerMarquee />
      <Journey />
      <Services />
      <Partners />
      <Consultation />
    </main>
  );
}
