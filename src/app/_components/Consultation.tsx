import { Reveal } from '@/components/Reveal';
import { contact } from '@/content/contact';

export const Consultation = () => {
  return (
    <section id="contact" className="bg-surface-soft py-26">
      <Reveal className="mx-auto w-[min(100%-40px,var(--container-site))]">
        {/*
          The dark panel is ported as it stands. It breaks the brief's theme
          lock (retire item 8), which is deferred: the design phase decides
          between committing to a full theme and toning this down. Do not fix
          it here.
        */}
        <div className="grid overflow-hidden rounded-5xl bg-surface shadow-card lg:grid-cols-[0.82fr_1.18fr]">
          {/*
            styles.css line 601 sets both in one `background` shorthand. Split
            here on purpose: Tailwind cannot type a `bg-[...]` whose layers mix
            a gradient and a bare colour, and emits no rule at all for it. The
            painted result is the same, since background-image sits over
            background-color.
          */}
          <div className="bg-primary-dark bg-[image:radial-gradient(circle_at_20%_20%,rgb(210_170_104/0.15),transparent_28%)] p-7.5 text-white sm:p-12">
            <p className="mb-3 font-label text-xs font-extrabold uppercase tracking-[0.15em] text-accent-soft">
              Bezpłatna konsultacja
            </p>
            <h2 className="mb-4.5 font-display text-[clamp(38px,4.6vw,60px)] leading-[1.06] tracking-[-0.028em] font-bold">
              Zacznij od krótkiej rozmowy.
            </h2>
            <p className="max-w-[65ch] text-consult-body">
              Wypełnij formularz konsultacyjny Lendi. Skontaktuję się z Tobą,
              aby poznać temat i ustalić dalszy sposób działania.
            </p>

            <ul className="mt-4 max-w-[65ch] list-disc pl-4.5 text-consult-list">
              <li>bez zobowiązań,</li>
              <li>bez przesyłania dokumentów na pierwszym etapie,</li>
              <li>możliwość rozmowy online lub stacjonarnie.</li>
            </ul>

            <div className="mt-8 grid gap-3">
              <a
                href={contact.phoneHref}
                className="border-b border-white/10 py-3.25 transition hover:border-white/30"
              >
                <small className="block text-consult-label">Telefon</small>
                <strong className="block tabular-nums">{contact.phone}</strong>
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="border-b border-white/10 py-3.25 transition hover:border-white/30"
              >
                <small className="block text-consult-label">E-mail</small>
                <strong className="block">{contact.email}</strong>
              </a>
            </div>
          </div>

          <div className="bg-surface p-7.5 sm:p-9.5">
            {/*
              TODO: embed the official Lendi widget here.
              Retire item 1 forbids rebuilding the legacy fake form out of
              divs, so this stays a labeled slot until the real embed code
              arrives. The widget must bring its own loading, error and
              validation states (retire item 19) and cookie consent (item 27).
            */}
            <div
              data-testid="lendi-slot"
              className="grid min-h-105 place-items-center rounded-2xl border-2 border-dashed border-line p-8 text-center"
            >
              <div>
                <p className="font-label font-extrabold text-primary-dark">
                  Miejsce na formularz Lendi
                </p>
                {/* Legacy caption, styles.css .widget-caption, ported verbatim. */}
                <p className="mx-auto mt-2 max-w-[46ch] text-[13px] text-muted">
                  Podgląd miejsca na oficjalny widget Lendi. Po otrzymaniu kodu
                  zostanie osadzony bezpośrednio w tej sekcji albo na osobnej
                  podstronie.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
};
