import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomePage from '@/app/page';

describe('home page', () => {
  it('renders exactly one h1, carrying the hero headline', () => {
    render(<HomePage />);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(
      'Finanse i ubezpieczenia dopasowane do Twojej sytuacji.'
    );
  });

  it('keeps the marquee out of the hero section', () => {
    const { container } = render(<HomePage />);
    const hero = container.querySelector('#top');
    const marquee = container.querySelector('[aria-label="Wybrani partnerzy"]');
    expect(hero).not.toBeNull();
    expect(marquee).not.toBeNull();
    expect(hero!.contains(marquee)).toBe(false);
  });
});
