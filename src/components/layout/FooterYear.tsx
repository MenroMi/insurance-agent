'use client';

import { useEffect, useState } from 'react';

export const FooterYear = ({ buildYear }: { buildYear: number }) => {
  const [year, setYear] = useState(buildYear);

  useEffect(() => {
    const current = new Date().getFullYear();
    if (current !== buildYear) setYear(current);
  }, [buildYear]);

  return <span>{year}</span>;
};
