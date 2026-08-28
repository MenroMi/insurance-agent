import Link from 'next/link';

/*
 * Retire item 28: the legacy site had no 404 page at all, so there is nothing
 * to port here and nothing to check parity against. The visual language is
 * borrowed from the ported sections rather than invented: same container, same
 * eyebrow treatment, same two button styles as the hero.
 *
 * Route files must default-export, so this does not follow the named-arrow-const
 * convention the components use.
 */
export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[60vh] w-[min(100%-40px,var(--container-site))] place-items-center py-26">
      <div className="max-w-140 text-center">
        <p className="font-label text-xs font-extrabold uppercase tracking-[0.15em] text-primary">
          404
        </p>
        <h1 className="mt-3 mb-4.5 font-display text-[clamp(38px,4.6vw,56px)] leading-[1.06] font-bold tracking-[-0.028em]">
          404. Nie znaleźliśmy tej strony.
        </h1>
        <p className="mx-auto max-w-[52ch] text-muted">
          Adres mógł się zmienić albo zawierać literówkę. Poniżej znajdziesz
          najważniejsze sekcje serwisu.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3.5">
          <Link
            href="/"
            className="inline-flex min-h-13.5 items-center justify-center rounded-pill bg-primary px-6 font-label font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-primary-strong active:translate-y-0"
          >
            Strona główna
          </Link>
          {/* Retire item 4: one label for every link that resolves to #contact. */}
          <Link
            href="/#contact"
            className="inline-flex min-h-13.5 items-center justify-center rounded-pill border border-line bg-surface px-6 font-label font-extrabold text-ink transition hover:-translate-y-0.5 active:translate-y-0"
          >
            Bezpłatna konsultacja
          </Link>
        </div>
      </div>
    </main>
  );
}
