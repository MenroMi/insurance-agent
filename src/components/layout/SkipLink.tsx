/**
 * Retire item 18. Targets #top, which Task 6 puts on the hero section; that
 * section must carry tabIndex={-1} or the browser scrolls without moving focus.
 */
export const SkipLink = () => {
  return (
    <a
      href="#top"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-surface focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-primary-dark focus:shadow-card"
    >
      Przejdź do treści
    </a>
  );
};
