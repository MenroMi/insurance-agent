import { Hero } from '@/app/_components/Hero';
import { Journey } from '@/app/_components/Journey';
import { PartnerMarquee } from '@/app/_components/PartnerMarquee';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <PartnerMarquee />
      <Journey />
    </main>
  );
}
