import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import NotFound from '@/app/not-found';
import PrivacyPage, { metadata } from '@/app/privacy-policy/page';
import { renderedText } from '../helpers/renderedText';

describe('the 404 boundary', () => {
  it('names itself and offers a way back from inside the page', () => {
    const { container } = render(<NotFound />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(
      /404/
    );

    // Scoped to the page's own <main>, not the shell: the header nav also has a
    // "Strona główna" link, so an unscoped query would pass with no link here.
    const main = container.querySelector('main');
    expect(main).not.toBeNull();
    expect(
      within(main as HTMLElement).getByRole('link', { name: 'Strona główna' })
    ).toHaveAttribute('href', '/');
  });

  it('uses the one unified CTA label for the consultation link', () => {
    // Retire item 4, in scope per plan line 46.
    const { container } = render(<NotFound />);
    const cta = within(container).getByRole('link', {
      name: 'Bezpłatna konsultacja',
    });
    expect(cta).toHaveAttribute('href', '/#contact');
  });

  it('never lets an English URL slug reach the Polish prose', () => {
    const { container } = render(<NotFound />);
    expect(renderedText(container)).not.toMatch(
      /\b(contact|partners|services)\b/i
    );
  });
});

describe('the privacy-policy placeholder', () => {
  it('is labeled a draft rather than presenting itself as a policy', () => {
    render(<PrivacyPage />);
    expect(screen.getByTestId('legal-draft-notice')).toBeInTheDocument();
    expect(screen.getByText('Dokument w przygotowaniu')).toBeInTheDocument();
  });

  it('is kept out of the index but stays crawlable', () => {
    // noindex so an empty legal page is not indexed; follow so the layout's
    // header and footer links are still crawled. Task 16 lifts the noindex
    // once the real text and the cookie section land.
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it('carries no invented legal content', () => {
    // A placeholder that quietly grows real-looking clauses is the failure mode
    // this guards. DESIGN-BRIEF.md 11.F: legal copy is never silently written.
    const text = renderedText(render(<PrivacyPage />).container);
    expect(text).not.toMatch(/§|art\.\s*\d|RODO\s+stanowi|Administratorem\s+/i);
  });
});
