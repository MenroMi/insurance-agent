import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { JourneyTrack } from '@/app/_components/JourneyTrack';

beforeAll(() => {
  // Reduced motion pins the bar at scaleY 1. jsdom has no layout, so the
  // scroll-driven path cannot be exercised here at all; tests/e2e/journey.spec.ts
  // covers it in a real browser.
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

describe('JourneyTrack', () => {
  it('renders server-provided children untouched', () => {
    render(
      <JourneyTrack>
        <article>Krok pierwszy</article>
        <article>Krok drugi</article>
      </JourneyTrack>
    );
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByText('Krok pierwszy')).toBeVisible();
  });

  it('drives the progress bar with a transform, never with height', () => {
    render(
      <JourneyTrack>
        <article>Krok</article>
      </JourneyTrack>
    );
    const bar = screen.getByTestId('journey-progress');
    expect(bar.style.height).toBe('');
    expect(bar.className).toContain('origin-top');
  });
});
