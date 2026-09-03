import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Partners } from '@/app/_components/Partners';

describe('Partners', () => {
  it('renders 22 named logos with alt text', () => {
    render(<Partners />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(22);
    for (const img of images) {
      expect(img).toHaveAttribute('alt', expect.stringMatching(/\S/));
    }
  });

  it('labels the two groups', () => {
    render(<Partners />);
    expect(
      screen.getByRole('heading', { name: 'Ubezpieczenia' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Banki' })).toBeInTheDocument();
  });

  it('leaves the svg logos unoptimized and points every src at /logos', () => {
    render(<Partners />);
    const images = screen.getAllByRole('img');
    // next/image rewrites raster sources through /_next/image but passes .svg
    // straight through, since it never optimizes SVG without dangerouslyAllowSVG.
    const svgs = images.filter((img) =>
      (img.getAttribute('src') ?? '').endsWith('.svg')
    );
    expect(svgs).toHaveLength(18);
    for (const img of svgs) {
      expect(img.getAttribute('src')).toMatch(/^\/logos\//);
    }
  });
});
