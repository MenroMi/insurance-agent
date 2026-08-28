import { afterEach, describe, expect, it, vi } from 'vitest';

const load = async () => {
  const mod = await import('@/lib/structuredData');
  return mod.buildStructuredData;
};

afterEach(() => {
  vi.resetModules();
  vi.doUnmock('@/content/contact');
  vi.doUnmock('@/content/site');
});

const realistic = {
  contact: {
    phone: '+48 601 234 567',
    phoneHref: 'tel:+48601234567',
    email: 'hanna@przyklad.pl',
    location: 'Zielona Góra',
    isPlaceholder: false,
  },
  site: {
    name: 'Hanna Khudziakova',
    role: 'Ubezpieczenia i finanse',
    description: 'Konsultacje w zakresie ubezpieczeń i finansowania.',
    baseUrl: 'https://przyklad.pl',
  },
};

describe('buildStructuredData', () => {
  it('publishes nothing while the contact details are placeholders', async () => {
    // Today's state. A ProfessionalService record carrying +48 000 000 000 is a
    // machine-readable claim about a real business that happens to be false.
    const build = await load();
    expect(build()).toBeNull();
  });

  it('publishes nothing while the domain is the placeholder, even with real contacts', async () => {
    vi.doMock('@/content/contact', () => ({
      contact: { ...realistic.contact },
    }));
    vi.doMock('@/content/site', () => ({
      site: { ...realistic.site, baseUrl: 'https://example.invalid' },
    }));
    vi.resetModules();

    const build = await load();
    expect(build()).toBeNull();
  });

  it('describes the advisory once both blockers are lifted', async () => {
    vi.doMock('@/content/contact', () => ({ contact: realistic.contact }));
    vi.doMock('@/content/site', () => ({ site: realistic.site }));
    vi.resetModules();

    const build = await load();
    const data = build();

    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: 'Hanna Khudziakova',
      url: 'https://przyklad.pl',
      telephone: '+48 601 234 567',
      email: 'hanna@przyklad.pl',
      address: { '@type': 'PostalAddress', addressLocality: 'Zielona Góra' },
    });
  });

  it('invents no claim the content modules do not carry', async () => {
    vi.doMock('@/content/contact', () => ({ contact: realistic.contact }));
    vi.doMock('@/content/site', () => ({ site: realistic.site }));
    vi.resetModules();

    const build = await load();
    const keys = Object.keys(build() ?? {});

    // DESIGN-BRIEF.md 11.F: claims about the business are never silently
    // authored. Opening hours, price range and ratings are the fields a
    // generator reaches for by default, and we know none of them.
    for (const invented of [
      'openingHours',
      'openingHoursSpecification',
      'priceRange',
      'aggregateRating',
      'review',
      'streetAddress',
    ]) {
      expect(keys).not.toContain(invented);
    }
  });
});
