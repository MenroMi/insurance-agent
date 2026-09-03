import { JourneyTrack } from '@/app/_components/JourneyTrack';
import { Reveal } from '@/components/Reveal';
import { benefits } from '@/content/benefits';
import { journeySteps } from '@/content/journey';

export const Journey = () => {
  return (
    <section id="how-it-works" className="bg-surface py-26">
      <div className="mx-auto grid w-[min(100%-40px,var(--container-site))] items-start gap-21 lg:grid-cols-[.82fr_1.18fr]">
        <Reveal className="lg:sticky lg:top-28">
          <p className="mb-3 font-label text-xs font-extrabold uppercase tracking-[0.15em] text-primary">
            Jak wygląda współpraca
          </p>
          <h2 className="mb-4.5 font-display text-[clamp(38px,4.6vw,60px)] leading-[1.06] tracking-[-0.028em] font-bold">
            Od pierwszego kontaktu do decyzji, bez chaosu i bez presji.
          </h2>
          <p className="max-w-[65ch] text-lg text-muted">
            Każdy etap ma konkretny cel. Najpierw poznaję Twoją sytuację,
            później porządkujemy potrzeby, a dopiero na końcu porównujemy
            dostępne możliwości.
          </p>

          <figure className="mt-10 rounded-2xl border border-line bg-page p-6.5 shadow-card-soft">
            {/*
              index.html line 167, styles.css line 847. The plan dropped this
              gold quote mark silently, the same way it dropped the one on the
              about page; both are restored rather than treated as a decision,
              because retire item 3 is out of scope. Decorative punctuation, so
              it is hidden from assistive tech instead of being read aloud.
            */}
            <span
              aria-hidden="true"
              className="block h-9 font-display text-[54px] leading-[0.85] text-accent"
            >
              &ldquo;
            </span>
            <blockquote className="mt-2.5 text-xl font-bold leading-relaxed">
              Dobra decyzja finansowa zaczyna się od rozmowy, a nie od wyboru
              pierwszej oferty.
            </blockquote>
            <figcaption className="mt-4.5 text-muted">
              Hanna Khudziakova
            </figcaption>
          </figure>

          <a
            href="#contact"
            className="mt-7 inline-flex min-h-13.5 items-center justify-center rounded-pill bg-primary px-6 font-label font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-primary-strong active:translate-y-0"
          >
            Bezpłatna konsultacja
          </a>
        </Reveal>

        <JourneyTrack>
          {journeySteps.map((step) => (
            <article key={step.n} className="relative pl-[82px]">
              <div className="absolute left-2.5 top-7 z-2 grid size-11 place-items-center rounded-full border-2 border-primary bg-primary font-label font-extrabold text-white">
                {step.n}
              </div>
              <div className="rounded-2xl border border-line bg-surface p-7 shadow-card-soft transition hover:-translate-y-0.5">
                <span className="font-label text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">
                  {step.kicker}
                </span>
                <h3 className="mb-2 mt-1.5 text-2xl font-bold">{step.title}</h3>
                <p className="max-w-[65ch] text-muted">{step.body}</p>
                <div className="mt-4.5 flex flex-wrap gap-2">
                  {step.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-pill bg-surface-blue px-3 py-2 text-[11px] font-bold text-chip-ink"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </JourneyTrack>
      </div>

      <div className="mx-auto mt-17 grid w-[min(100%-40px,var(--container-site))] gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b) => (
          <Reveal key={b.label}>
            {/* tabular-nums keeps the figures aligned across cards, retire item 21 */}
            <div className="h-full rounded-2xl border border-line bg-page p-6">
              <strong className="block font-label text-3xl tabular-nums text-primary">
                {b.figure}
              </strong>
              <span className="mt-1.5 block font-bold">{b.label}</span>
              <p className="mt-2.5 text-[13px] text-muted">{b.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
