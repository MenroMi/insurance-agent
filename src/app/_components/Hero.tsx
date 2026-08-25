import { Reveal } from '@/components/Reveal';
import { contact } from '@/content/contact';
import { site } from '@/content/site';

export const Hero = () => {
  return (
    // tabIndex={-1} is what makes the skip link actually move focus here; a
    // plain anchor jump only scrolls a non-focusable element into view.
    <section
      id="top"
      tabIndex={-1}
      className="relative bg-linear-to-b from-surface-blue/90 to-page/98 pb-11 pt-25"
    >
      {/*
        The clip sits on this wrapper rather than on the section. The glows have
        to be contained, the gold one reaches past the left edge; but clipping
        the whole section also cut the portrait card's shadow, which needs about
        57px below the card against the 44px the section's padding leaves.
      */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-[2%] top-[2%] size-[390px] rounded-full bg-glow-blue opacity-36 blur-[90px]" />
        <div className="absolute bottom-[2%] left-[-5%] size-[280px] rounded-full bg-glow-gold opacity-36 blur-[90px]" />
      </div>

      <div className="relative z-2 mx-auto grid w-[min(100%-40px,var(--container-site))] items-center gap-20 lg:grid-cols-[1.08fr_.92fr]">
        <Reveal>
          <div className="mb-7 w-fit rounded-pill border border-hero-badge-line bg-white/72 px-3.5 py-2.5 text-xs font-bold text-primary-dark">
            <span className="mr-2 inline-block size-2 rounded-full bg-success shadow-[0_0_0_6px_rgb(74_147_109/0.12)]" />
            Konsultacje online i stacjonarnie w Zielonej Górze
          </div>

          <h1 className="mb-6.5 max-w-[760px] font-display text-[clamp(44px,5.2vw,66px)] leading-[1.06] tracking-[-0.028em] font-bold">
            Finanse i ubezpieczenia dopasowane do Twojej sytuacji.
          </h1>

          <p className="max-w-[65ch] text-[19px] text-muted">
            Pomagam porównać dostępne rozwiązania, wyjaśniam najważniejsze
            różnice i prowadzę przez cały proces, od pierwszej rozmowy do wyboru
            właściwej oferty.
          </p>

          <div className="my-8.5 flex flex-wrap gap-3.5">
            <a
              href="#contact"
              className="inline-flex min-h-13.5 items-center justify-center rounded-pill bg-primary px-6 font-label font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-primary-strong active:translate-y-0"
            >
              Bezpłatna konsultacja
            </a>
            <a
              href="#services"
              className="inline-flex min-h-13.5 items-center justify-center rounded-pill border border-line bg-white/75 px-6 font-label font-extrabold text-ink transition hover:-translate-y-0.5 active:translate-y-0"
            >
              Zobacz zakres usług
            </a>
          </div>

          <p className="max-w-[65ch] text-[11px] text-hero-fineprint">
            Zakres dostępnych produktów zależy od aktualnych uprawnień i
            współpracy z daną instytucją.
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="overflow-hidden rounded-5xl border border-white/80 bg-surface shadow-card">
            <div className="relative grid min-h-[450px] place-items-center content-center gap-3.5 bg-[radial-gradient(circle_at_50%_25%,rgb(255_255_255/0.85),transparent_27%),linear-gradient(145deg,#d9e9f3,#f3e9d8)] text-primary-dark">
              <span className="grid size-[170px] place-items-center rounded-full border border-primary/12 bg-white/78 font-display text-[52px]">
                HK
              </span>
              {/* TODO: professional advisor photograph, 900x1100.
                  DESIGN-BRIEF.md section 8.3 and retire item 14. */}
              <small className="font-bold opacity-65">
                Miejsce na profesjonalne zdjęcie doradcy
              </small>
              <div className="absolute right-5.5 top-5.5 rounded-pill border border-primary/14 bg-white/88 px-3.5 py-2.5 text-[11px] font-extrabold text-primary-dark shadow-card-soft">
                <span className="mr-2 inline-block size-2 rounded-full bg-success" />
                Bezpłatna konsultacja
              </div>
            </div>

            <div className="grid gap-5 p-6.5 md:grid-cols-[1fr_auto]">
              <div>
                <span className="font-label text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary">
                  Twój doradca
                </span>
                <p className="mb-1.5 mt-1 font-label text-2xl font-bold">
                  {site.name}
                </p>
                <p className="text-[13px] text-muted">
                  Ubezpieczenia, kredyty i rozwiązania finansowe
                </p>
              </div>
              <div className="flex flex-col justify-center text-xs font-bold md:text-right">
                <a className="text-primary" href={contact.phoneHref}>
                  {contact.phone}
                </a>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
