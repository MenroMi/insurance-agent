/**
 * Single source for the primary nav. Labels stay Polish, hrefs are English;
 * the two are independent by design (see the plan's Global Constraints).
 */
export const navItems = [
  { label: 'Strona główna', href: '/' },
  { label: 'Poznaj Hannę', href: '/about-me' },
  { label: 'Usługi', href: '/#services' },
  { label: 'Partnerzy', href: '/#partners' },
  { label: 'Bezpłatna konsultacja', href: '/#contact' },
] as const;
