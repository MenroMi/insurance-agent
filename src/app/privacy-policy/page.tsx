import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Polityka prywatności',
  /*
   * noindex keeps an empty legal page out of the index until it carries real
   * content. `follow` stays true: the plan's snippet paired it with
   * follow: false, which would also tell crawlers to ignore the header and
   * footer links rendered by the layout. noindex + follow is the conventional
   * pairing for a placeholder that is still part of the site.
   * Task 16 removes the noindex once the real text lands.
   */
  robots: { index: false, follow: true },
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-[min(100%-40px,var(--container-site))] py-26">
      <h1 className="mb-6 max-w-180 font-display text-[clamp(38px,4.6vw,56px)] leading-[1.06] font-bold tracking-[-0.028em]">
        Polityka prywatności
      </h1>

      {/*
        This page is a shell. The legal text must be written or approved by a
        human; DESIGN-BRIEF.md sections 8.3 and 11.F treat legal copy as never
        silently changed. Do not generate legal content.

        The cookie section and the consent flow are Task 16, blocked on the
        Lendi embed: the site sets no cookie and loads no third-party code
        today, so there is nothing yet to consent to.
      */}
      <div
        data-testid="legal-draft-notice"
        className="max-w-[65ch] rounded-2xl border-2 border-dashed border-line bg-surface p-8"
      >
        <p className="font-label font-extrabold text-primary-dark">
          Dokument w przygotowaniu
        </p>
        <p className="mt-2 text-muted">
          Treść polityki prywatności oraz informacja RODO zostaną opublikowane
          przed uruchomieniem formularza konsultacyjnego. W sprawach dotyczących
          danych osobowych prosimy o kontakt bezpośredni.
        </p>
      </div>
    </main>
  );
}
