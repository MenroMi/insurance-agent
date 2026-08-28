import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Services } from '@/app/_components/Services';

beforeAll(() => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
});

describe('Services', () => {
  it('renders all six service titles', () => {
    render(<Services />);
    expect(screen.getAllByRole('article')).toHaveLength(6);
    expect(screen.getByText('Ubezpieczenia na życie')).toBeInTheDocument();
    expect(screen.getByText('Kredyty i finansowanie')).toBeInTheDocument();
  });

  it('keeps one visible CTA label but a distinct name per card', () => {
    render(<Services />);
    // Retire item 4 collapses six legacy labels into one visible label. The
    // accessible name still has to differ, or the links list reads as six
    // identical entries; it starts with the visible text, per WCAG 2.5.3.
    const links = screen.getAllByRole('link', {
      name: /^Bezpłatna konsultacja/,
    });
    expect(links).toHaveLength(6);
    expect(new Set(links.map((l) => l.getAttribute('aria-label'))).size).toBe(
      6
    );
    expect(links[0]).toHaveTextContent('Bezpłatna konsultacja');
  });

  it('marks the icons as decorative', () => {
    const { container } = render(<Services />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs).toHaveLength(6);
    for (const svg of svgs) {
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('contains no emoji', () => {
    const { container } = render(<Services />);
    expect(container.textContent ?? '').not.toMatch(
      /\p{Extended_Pictographic}/u
    );
  });
});
