import type { Metadata } from 'next';
import Link from 'next/link';
import { AboutHero } from '@/app/about-me/_components/AboutHero';
import { AboutWorking } from '@/app/about-me/_components/AboutWorking';
import { Reveal } from '@/components/Reveal';

export const metadata: Metadata = {
  // The legacy <title> and meta description both carried an em-dash. Global
  // Constraints ban it, so the separator becomes a colon and the title suffix
  // is left to Task 13, which owns the title template.
  title: 'Poznaj Hannę',
  description:
    'Poznaj Hannę Khudziakovą: sposób pracy, bezpośredni kontakt i podejście do konsultacji ubezpieczeniowych oraz finansowych.',
  alternates: { canonical: '/about-me' },
};

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <AboutWorking />

      <section className="bg-surface pt-4 pb-26">
        <Reveal className="mx-auto w-[min(100%-40px,var(--container-site))]">
          <div className="rounded-4xl border border-line bg-surface-blue px-6 py-7.5 sm:px-12.5 sm:py-10.5">
            {/*
              poznaj-hanne.html line 86, styles.css line 1090. Decorative, so it
              is hidden from the accessible name of the quote rather than read
              aloud as a stray punctuation mark.
            */}
            <span
              aria-hidden="true"
              className="block font-display text-[68px] font-bold leading-[0.65] text-accent"
            >
              &ldquo;
            </span>
            <blockquote className="mt-4.5 mb-3 max-w-[930px] font-display text-[clamp(27px,3vw,42px)] font-bold leading-[1.3]">
              Moim celem nie jest sprzedaż produktu. Chcę pomóc Ci podjąć
              decyzję, z którą będziesz czuć się bezpiecznie również później.
            </blockquote>
            <p className="max-w-[65ch] text-muted">
              Masz pytania dotyczące ubezpieczenia, kredytu albo finansowania?
              Pierwsza rozmowa pozwoli uporządkować temat i określić dalszy
              krok.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="bg-surface-soft py-26">
        <Reveal className="mx-auto w-[min(100%-40px,var(--container-site))]">
          <div className="grid items-center gap-10 rounded-4xl bg-primary-dark px-6 py-7.5 text-white shadow-card sm:px-12 sm:py-10.5 lg:grid-cols-[1fr_auto]">
            <div>
              {/*
                poznaj-hanne.html line 96. Retire item 3 is out of scope, plan
                line 48. styles.css line 1097 tints it gold on the dark panel,
                the same treatment Consultation.tsx uses.
              */}
              <p className="mb-3 font-label text-xs font-extrabold uppercase tracking-[0.15em] text-accent-soft">
                Bezpłatna konsultacja
              </p>
              <h2 className="mb-2.5 font-display text-[clamp(34px,4vw,50px)] leading-[1.06] tracking-[-0.028em]">
                Porozmawiajmy o Twojej sytuacji.
              </h2>
              <p className="max-w-[65ch] text-cta-body">
                Pierwsza rozmowa jest bez zobowiązań i nie wymaga przesyłania
                dokumentów.
              </p>
            </div>
            {/*
              The legacy label here was "Przejdź do konsultacji". Retire item 4
              (CTA label unification) is in scope, plan line 46: every link
              resolving to #contact carries the one label.
            */}
            <Link
              href="/#contact"
              className="inline-flex min-h-13.5 w-full items-center justify-center whitespace-nowrap rounded-pill bg-primary px-6 font-label font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-primary-strong active:translate-y-0 sm:w-fit"
            >
              Bezpłatna konsultacja
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
