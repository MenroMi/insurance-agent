import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Consultation } from '@/app/_components/Consultation';
import { contact } from '@/content/contact';

describe('Consultation', () => {
  it('renders no fake form controls', () => {
    render(<Consultation />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('exposes the widget slot for the real embed', () => {
    render(<Consultation />);
    expect(screen.getByTestId('lendi-slot')).toBeInTheDocument();
  });

  it('offers the contact details as real links', () => {
    render(<Consultation />);
    expect(screen.getByRole('link', { name: /\+48/ })).toHaveAttribute(
      'href',
      contact.phoneHref
    );
    expect(screen.getByRole('link', { name: /@/ })).toHaveAttribute(
      'href',
      `mailto:${contact.email}`
    );
  });

  it('keeps the legacy eyebrow', () => {
    render(<Consultation />);
    // styles.css line 606 styles it, index.html line 383 carries it. Retire
    // item 3 (eyebrow reduction) is out of scope, plan line 48, so dropping it
    // here would be undocumented design work.
    expect(screen.getByText('Bezpłatna konsultacja')).toBeInTheDocument();
  });

  it('never lets the English anchor slug reach the Polish prose', () => {
    const { container } = render(<Consultation />);
    // Global Constraints: `kontakt` is an ordinary Polish word as well as the
    // former slug. The #contact rename must stay in hrefs only.
    expect(container.textContent).not.toMatch(/\bcontact\b/i);
  });
});
