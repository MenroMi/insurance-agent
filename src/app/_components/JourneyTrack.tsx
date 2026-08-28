'use client';

import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { useRef } from 'react';

export const JourneyTrack = ({ children }: { children: React.ReactNode }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // useScroll instead of window.addEventListener("scroll") and instead of
  // measuring offsetHeight in JS. Progress is a transform, never a height.
  // scrollYProgress already runs 0 to 1, so it feeds the spring directly.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start center', 'end center'],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 20 });

  return (
    <div ref={trackRef} className="relative grid gap-5.5">
      {/* static rail */}
      <div className="absolute bottom-8 left-[30px] top-8 w-[3px] rounded-pill bg-line" />
      {/* animated progress; scaleY, so no layout is recalculated */}
      <motion.div
        data-testid="journey-progress"
        style={{ scaleY: reduce ? 1 : scaleY }}
        className="absolute bottom-8 left-[30px] top-8 w-[3px] origin-top rounded-pill bg-linear-to-b from-primary to-accent"
      />
      {children}
    </div>
  );
};
