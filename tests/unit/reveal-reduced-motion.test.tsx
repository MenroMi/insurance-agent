import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Reveal } from '@/components/Reveal';

beforeAll(() => {
  // Motion reads the preference once, into a module-level singleton, so this
  // must be set before the first render and cannot be undone within the file.
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

describe('Reveal under prefers-reduced-motion', () => {
  it('degrades to static instead of hiding the content', () => {
    render(
      <Reveal>
        <p>Widoczna treść</p>
      </Reveal>
    );
    expect(screen.getByText('Widoczna treść')).toBeVisible();
  });
});
