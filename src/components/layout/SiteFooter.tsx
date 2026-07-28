import Link from 'next/link';
import { contact } from '@/content/contact';
import { site } from '@/content/site';

export const SiteFooter = () => {
  return (
    <footer className="bg-footer pb-6 pt-14 text-white">
      <div className="mx-auto grid w-[min(100%-40px,var(--container-site))] gap-15 md:grid-cols-[1.5fr_.7fr_.7fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="grid size-[42px] place-items-center rounded-full bg-accent font-label font-extrabold text-primary-dark">
              HK
            </span>
            <span className="block">
              <strong className="block text-sm">{site.name}</strong>
              <small className="block text-[11px] text-footer-muted">
                {site.role}
              </small>
            </span>
          </Link>
          <p className="mt-4.5 max-w-[470px] text-xs text-footer-muted">
            Strona informacyjna. Zakres produktów zależy od posiadanych
            uprawnień oraz aktualnej współpracy z partnerami.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <strong>Serwis</strong>
          <Link className="text-[13px] text-footer-link" href="/#how-it-works">
            Jak działam
          </Link>
          <Link className="text-[13px] text-footer-link" href="/#services">
            Usługi
          </Link>
          <Link className="text-[13px] text-footer-link" href="/#partners">
            Partnerzy
          </Link>
          {/* Retire item 26: the legacy footer had no legal link at all. */}
          <Link className="text-[13px] text-footer-link" href="/privacy-policy">
            Polityka prywatności
          </Link>
        </div>

        <div className="flex flex-col gap-2.5">
          <strong>Kontakt</strong>
          <a className="text-[13px] text-footer-link" href={contact.phoneHref}>
            {contact.phone}
          </a>
          <a
            className="text-[13px] text-footer-link"
            href={`mailto:${contact.email}`}
          >
            {contact.email}
          </a>
        </div>
      </div>

      <div className="mx-auto mt-10 flex w-[min(100%-40px,var(--container-site))] flex-col gap-1.5 border-t border-white/10 pt-5 text-[11px] text-footer-faint md:flex-row md:justify-between">
        <span>
          &copy;{' '}
          <span suppressHydrationWarning>{new Date().getFullYear()}</span>{' '}
          {site.name}
        </span>
      </div>
    </footer>
  );
};
