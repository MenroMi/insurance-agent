'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { navItems } from '@/content/nav';
import { site } from '@/content/site';

export const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-80 border-b border-line/85 bg-page/85 backdrop-blur-lg">
      <div className="mx-auto flex min-h-19.5 w-[min(100%-40px,var(--container-site))] items-center justify-between">
        {/*
         * No aria-label here. The legacy brand link carried
         * aria-label="Strona główna", which both collided with the nav item of
         * that name and hid the visible brand text from the accessible name
         * (WCAG 2.5.3 Label in Name). The text content names the link.
         */}
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="grid size-10.5 place-items-center rounded-full bg-primary font-label font-extrabold text-white">
            HK
          </span>
          <span className="block">
            <strong className="block text-sm">{site.name}</strong>
            <small className="block text-[11px] text-muted">{site.role}</small>
          </span>
        </Link>

        <button
          type="button"
          aria-label={open ? 'Zamknij menu' : 'Otwórz menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="p-2 lg:hidden"
        >
          <span className="mb-1.25 block h-0.5 w-6 bg-ink" />
          <span className="mb-1.25 block h-0.5 w-6 bg-ink" />
          <span className="block h-0.5 w-6 bg-ink" />
        </button>

        <nav
          aria-label="Główna nawigacja"
          data-open={open}
          className="absolute inset-x-5 top-19.5 hidden flex-col gap-3.5 rounded-xl border border-line bg-surface p-5 shadow-card data-[open=true]:flex lg:static lg:flex lg:flex-row lg:items-center lg:gap-6 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
        >
          {navItems.map((item) => {
            const isCta = item.href === '/#contact';
            const isActive = item.href === pathname;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={
                  isCta
                    ? 'rounded-pill bg-primary px-4.5 py-3 text-[13px] font-bold text-white transition-colors hover:bg-primary-strong active:translate-y-px'
                    : `text-[13px] font-bold transition-colors hover:text-primary active:translate-y-px ${isActive ? 'text-primary' : ''}`
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
