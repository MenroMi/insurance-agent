/**
 * Single source of truth for contact details. The legacy HTML repeated these
 * same placeholders in 6 places (DESIGN-BRIEF.md retire item 13).
 */
export const contact = {
  phone: "+48 000 000 000",
  phoneHref: "tel:+48000000000",
  email: "kontakt@twojadomena.pl",
  location: "Zielona Góra",
  isPlaceholder: true,
} as const;
