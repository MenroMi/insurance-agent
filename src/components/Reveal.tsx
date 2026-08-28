'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

/** Fraction of an element that must be visible before it reveals. */
const AMOUNT = 0.12;

/*
 * One IntersectionObserver for the whole page, not one per <Reveal>.
 * `useInView` in motion 12.42.2 constructs an observer per call
 * (framer-motion/dist/es/utils/use-in-view.mjs), and the site mounts 16
 * Reveals. The legacy script.js used a single observer for all 28 elements.
 * DESIGN-BRIEF.md section 8.4 measured the cost as immaterial, so this is a
 * tidiness fix; the behaviour it replaces is reproduced exactly, including the
 * `once` semantics.
 */
let observer: IntersectionObserver | null = null;
const pending = new Map<Element, () => void>();

const getObserver = () => {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const reveal = pending.get(entry.target);
        if (!reveal) continue;
        // `once`: stop watching the moment it has been seen, so a long page
        // does not keep re-notifying for elements that are already revealed.
        pending.delete(entry.target);
        observer?.unobserve(entry.target);
        reveal();
      }
    },
    { threshold: AMOUNT }
  );
  return observer;
};

const observe = (element: Element, reveal: () => void) => {
  // jsdom has no IntersectionObserver. Revealing immediately is the correct
  // fallback: it matches the no-JavaScript stance the server markup already
  // takes, and it keeps the unit tests exercising the visible state.
  if (typeof IntersectionObserver === 'undefined') {
    reveal();
    return () => {};
  }

  pending.set(element, reveal);
  getObserver().observe(element);

  return () => {
    pending.delete(element);
    observer?.unobserve(element);
  };
};

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

export const Reveal = ({ children, delay = 0, className }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [inView, setInView] = useState(false);

  // CRITICAL: do not pass a hidden state through the `initial` prop. Motion
  // serialises `initial` into inline styles during SSR, so `opacity: 0` would
  // ship in the HTML and the content would stay invisible without JS. That is
  // exactly the trap the legacy `.reveal { opacity: 0 }` rule had.
  // Instead we animate via `animate`, and the hidden state only switches on
  // after hydration. The server always renders the content visible.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const element = ref.current;
    if (!element) return;
    return observe(element, () => setInView(true));
  }, []);

  const hidden = mounted && !reduce && !inView;

  return (
    <motion.div
      ref={ref}
      className={className}
      animate={{ opacity: hidden ? 0 : 1, y: hidden ? 22 : 0 }}
      // Hiding is instant, revealing is animated. A shared duration would make
      // anything straddling the fold line visibly fade out right after
      // hydration, since it has not cleared the 0.12 threshold yet.
      transition={
        hidden
          ? { duration: 0 }
          : { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }
      }
    >
      {children}
    </motion.div>
  );
};
