import { Reveal } from '@/components/Reveal';
import { contact } from '@/content/contact';

export const AboutHero = () => {
  return (
    <section className="bg-gradient-to-b from-surface-blue to-page pt-12.5 pb-14.5 sm:pt-17.5 sm:pb-19">
      <div className="mx-auto grid w-[min(100%-40px,var(--container-site))] items-center gap-14.5 lg:grid-cols-[440px_1fr]">
        <Reveal>
          {/*
            styles.css line 1064 uses linear-gradient(145deg, ...), which is not
            one of Tailwind's eight bg-gradient-to-* directions; bg-gradient-to-br
            would silently paint 135deg instead. Both layers are images here, so
            a single bracket value is safe, unlike the mixed gradient-plus-colour
            case in Consultation.tsx.
          */}
          <div className="max-w-[650px] overflow-hidden rounded-3xl bg-[image:linear-gradient(145deg,var(--color-photo-blue),var(--color-photo-sand))] shadow-card-soft lg:max-w-none">
            <div className="grid min-h-92.5 place-items-center content-center gap-3.5 text-primary-dark sm:min-h-125">
              <span className="grid size-[150px] place-items-center rounded-full bg-white/82 font-display text-[46px] font-bold text-primary">
                HK
              </span>
              {/* TODO: candid photograph of Hanna, 880x1000. DESIGN-BRIEF.md section 8.3. */}
              <small className="font-bold text-muted">
                Miejsce na naturalne zdjęcie Hanny
              </small>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          {/*
            poznaj-hanne.html line 38. Retire item 3 (eyebrow reduction) is out
            of scope, plan line 48, so this is ported as it stands.
          */}
          <p className="mb-3 font-label text-xs font-extrabold uppercase tracking-[0.15em] text-primary">
            Poznaj Hannę
          </p>
          <h1 className="mt-2.5 mb-5 max-w-[720px] font-display text-[clamp(40px,4.6vw,58px)] leading-[1.06] tracking-[-0.028em]">
            Wierzę, że dobra decyzja finansowa zaczyna się od zrozumienia Twojej
            sytuacji.
          </h1>
          <p className="max-w-[65ch] text-lg text-muted">
            Każda współpraca rozpoczyna się od rozmowy. Najpierw poznaję Twoje
            potrzeby, później analizuję dostępne możliwości, a dopiero na końcu
            wspólnie wybieramy rozwiązanie.
          </p>

          <div className="mt-6.25 rounded-r-xl border-l-4 border-accent bg-surface px-6 py-5.5 shadow-card-soft">
            <strong>Moja filozofia pracy</strong>
            <p className="mt-2 max-w-[65ch] text-muted">
              Nie wierzę w sprzedaż jednej oferty każdemu klientowi. Wolę
              poświęcić więcej czasu na zrozumienie sytuacji niż proponować
              rozwiązanie, które nie będzie odpowiadało Twoim potrzebom.
            </p>
          </div>

          {/*
            The legacy fourth tile was a Facebook link on href="#", a dead link
            and retire item 13. It is dropped rather than ported; the design
            phase re-adds it once a real profile URL exists.
          */}
          <div className="mt-6.25 grid gap-3 sm:grid-cols-2">
            <a
              href={contact.phoneHref}
              className="rounded-lg border border-line bg-white/82 px-4 py-3.5"
            >
              <small className="block font-label text-[10px] font-extrabold uppercase tracking-[0.09em] text-tile-label">
                Telefon
              </small>
              <strong className="mt-1.25 block text-[13px] tabular-nums">
                {contact.phone}
              </strong>
            </a>
            <a
              href={`mailto:${contact.email}`}
              className="rounded-lg border border-line bg-white/82 px-4 py-3.5"
            >
              <small className="block font-label text-[10px] font-extrabold uppercase tracking-[0.09em] text-tile-label">
                E-mail
              </small>
              <strong className="mt-1.25 block text-[13px]">
                {contact.email}
              </strong>
            </a>
            <div className="rounded-lg border border-line bg-white/82 px-4 py-3.5">
              <small className="block font-label text-[10px] font-extrabold uppercase tracking-[0.09em] text-tile-label">
                Spotkania
              </small>
              <strong className="mt-1.25 block text-[13px]">
                {contact.location} i online
              </strong>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
