import { render } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Reveal } from '@/components/Reveal';

/*
 * jsdom has no IntersectionObserver, so Reveal takes its reveal-immediately
 * fallback path unless one is supplied. Supplying a fake is what makes the
 * "how many observers" question answerable at all.
 */
const constructed = vi.fn();
const observed: Element[] = [];

class FakeIntersectionObserver {
  constructor(_cb: IntersectionObserverCallback, _opts?: object) {
    constructed();
  }
  observe(el: Element) {
    observed.push(el);
  }
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('Reveal observer sharing', () => {
  it('constructs one observer for many instances, and watches each element', () => {
    render(
      <>
        {Array.from({ length: 8 }, (_, i) => (
          <Reveal key={i}>
            <p>{`Blok ${i}`}</p>
          </Reveal>
        ))}
      </>
    );

    // The defect this guards: motion's useInView builds one observer per call.
    // Eight Reveals must still mean one observer, and eight observed elements.
    expect(constructed).toHaveBeenCalledTimes(1);
    expect(observed).toHaveLength(8);
  });
});
