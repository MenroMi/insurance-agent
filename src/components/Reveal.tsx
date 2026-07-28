'use client';

import { motion, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

export const Reveal = ({ children, delay = 0, className }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.12 });

  // CRITICAL: do not pass a hidden state through the `initial` prop. Motion
  // serialises `initial` into inline styles during SSR, so `opacity: 0` would
  // ship in the HTML and the content would stay invisible without JS. That is
  // exactly the trap the legacy `.reveal { opacity: 0 }` rule had.
  // Instead we animate via `animate`, and the hidden state only switches on
  // after hydration. The server always renders the content visible.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
