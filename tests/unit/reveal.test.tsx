import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Reveal } from '@/components/Reveal';

// No reduced-motion override here, so this file exercises the animating path.
// The reduced-motion case lives in its own file: Motion caches the preference
// in a module-level singleton on first read, so one stance per file.
describe('Reveal', () => {
  it('renders children', () => {
    render(
      <Reveal>
        <p>Widoczna treść</p>
      </Reveal>
    );
    expect(screen.getByText('Widoczna treść')).toBeInTheDocument();
  });

  it('ships no hidden state in the server-rendered markup', () => {
    const html = renderToStaticMarkup(
      <Reveal>
        <p>Widoczna treść</p>
      </Reveal>
    );

    // The whole point of the component: with JavaScript off, the server HTML
    // must not carry the hidden state. See Task 14's no-JS check.
    expect(html).toContain('Widoczna treść');
    expect(html).not.toMatch(/opacity:\s*0/);
    expect(html).not.toMatch(/translateY\((?!0px\))/);
  });

  it('passes className through to the wrapper', () => {
    const { container } = render(
      <Reveal className="probe-class">
        <p>Widoczna treść</p>
      </Reveal>
    );
    expect(container.firstElementChild).toHaveClass('probe-class');
  });
});
