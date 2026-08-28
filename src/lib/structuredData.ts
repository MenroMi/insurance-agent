import { contact } from '@/content/contact';
import { site } from '@/content/site';

/**
 * schema.org describing the advisory, for the home page only.
 *
 * DESIGN-BRIEF.md section 7 lists structured data as one of six SEO gaps, but
 * the migration plan's Task 13 has no step for it. Implemented here so the gap
 * closes, and GATED so it cannot ship wrong.
 *
 * The gate is `contact.isPlaceholder`. Publishing a ProfessionalService record
 * whose telephone is `+48 000 000 000`, whose email is `kontakt@twojadomena.pl`
 * and whose url is `https://example.invalid` would be worse than publishing
 * nothing: structured data is a machine-readable claim about a real business,
 * and search engines treat a wrong one as a reason to distrust the rest. When
 * the real details land in src/content/contact.ts and src/content/site.ts,
 * flipping that flag to false turns this on with no other change.
 */
export function buildStructuredData(): Record<string, unknown> | null {
  if (contact.isPlaceholder) return null;
  if (new URL(site.baseUrl).hostname.endsWith('.invalid')) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: site.name,
    description: site.description,
    url: site.baseUrl,
    telephone: contact.phone,
    email: contact.email,
    areaServed: contact.location,
    address: {
      '@type': 'PostalAddress',
      addressLocality: contact.location,
      addressCountry: 'PL',
    },
    // Only what the content modules actually know. No invented opening hours,
    // price range, rating or street address: section 11.F treats claims about
    // the business as never silently authored.
  };
}
