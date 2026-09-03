import '@testing-library/jest-dom/vitest';

/**
 * jsdom implements neither IntersectionObserver nor matchMedia (verified: both
 * are undefined). Motion's useInView calls `new IntersectionObserver` with no
 * guard, so without these stubs every test that renders a Reveal-wrapped
 * component throws. Both live here rather than per file because Reveal is
 * wrapped around most of the page from Task 7 onwards.
 */
class NoopIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [];
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

globalThis.IntersectionObserver = NoopIntersectionObserver;

// Nothing is in view and no reduced-motion preference is set, unless an
// individual test file overrides matchMedia before rendering.
globalThis.matchMedia = (query: string): MediaQueryList =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
