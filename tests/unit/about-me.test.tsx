import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AboutHero } from '@/app/about-me/_components/AboutHero';
import { AboutWorking } from '@/app/about-me/_components/AboutWorking';
import AboutPage from '@/app/about-me/page';
import { contact } from '@/content/contact';
import { renderedText } from '../helpers/renderedText';
import { collectStrings, findDashViolations } from '../helpers/dashGuard';

describe('AboutHero', () => {
  it('keeps the legacy eyebrow', () => {
    render(<AboutHero />);
    // poznaj-hanne.html line 38. Retire item 3 (eyebrow reduction) is out of
    // scope, plan line 48, so dropping it here would be undocumented design work.
    expect(screen.getByText('Poznaj Hannę')).toBeInTheDocument();
  });

  it('offers the contact details as real links, with no dead Facebook tile', () => {
    const { container } = render(<AboutHero />);
    expect(screen.getByRole('link', { name: /\+48/ })).toHaveAttribute(
      'href',
      contact.phoneHref
    );
    expect(screen.getByRole('link', { name: /@/ })).toHaveAttribute(
      'href',
      `mailto:${contact.email}`
    );
    // Retire item 13: the legacy fourth tile pointed at href="#".
    expect(container.querySelector('a[href="#"]')).toBeNull();
    expect(renderedText(container)).not.toMatch(/facebook/i);
  });
});

describe('AboutWorking', () => {
  it('renders the four blocks in legacy order', () => {
    render(<AboutWorking />);
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(4);
    expect(
      articles.map((a) => within(a).getByRole('heading').textContent)
    ).toEqual([
      'Najpierw rozmawiamy',
      'Porównuję możliwości',
      'Bez presji',
      'Jestem również później',
    ]);
  });

  it('paints the featured block with a separate colour and image layer', () => {
    render(<AboutWorking />);
    const featured = screen.getAllByRole('article')[0];
    // A single bg-[...] carrying both layers is the Task 10 defect: Tailwind
    // types nothing and emits no rule. The e2e test proves the painted result;
    // this one fails fast if the two classes are ever merged back.
    expect(featured).toHaveClass('bg-page');
    expect(featured.className).toMatch(/bg-\[image:radial-gradient/);
  });
});

describe('the /about-me page', () => {
  it('keeps the closing eyebrow and the unified CTA label', () => {
    render(<AboutPage />);
    // poznaj-hanne.html line 96 for the eyebrow; retire item 4 (in scope, plan
    // line 46) replaces the legacy "Przejdź do konsultacji" button label.
    expect(screen.getAllByText('Bezpłatna konsultacja')).toHaveLength(2);
    expect(
      screen.getByRole('link', { name: 'Bezpłatna konsultacja' })
    ).toHaveAttribute('href', '/#contact');
    expect(
      screen.queryByText(/Przejdź do konsultacji/)
    ).not.toBeInTheDocument();
  });

  it('never lets the English anchor slugs reach the Polish prose', () => {
    const { container } = render(<AboutPage />);
    // Global Constraints: `kontakt` and `partnerzy` are ordinary Polish words as
    // well as former slugs. The renames must stay in hrefs only.
    expect(renderedText(container)).not.toMatch(
      /\b(contact|partners|services)\b/i
    );
  });

  it('carries no em-dash or en-dash in its copy', () => {
    const { container } = render(<AboutPage />);
    expect(findDashViolations(collectStrings(renderedText(container)))).toEqual(
      []
    );
  });
});
