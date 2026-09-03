import { describe, expect, it } from 'vitest';
import { collectStrings, findDashViolations } from '../helpers/dashGuard';
import { navItems } from '@/content/nav';
import { services } from '@/content/services';
import { journeySteps } from '@/content/journey';
import {
  bankPartners,
  insurancePartners,
  marqueePartners,
} from '@/content/partners';
import { benefits } from '@/content/benefits';
import { contact } from '@/content/contact';
import { site } from '@/content/site';

const everything = {
  site,
  navItems,
  contact,
  services,
  journeySteps,
  insurancePartners,
  bankPartners,
  marqueePartners,
  benefits,
};

describe('content invariants', () => {
  it('contains zero em-dashes and en-dashes', () => {
    expect(findDashViolations(collectStrings(everything))).toEqual([]);
  });

  it('preserves the five nav labels verbatim', () => {
    expect(navItems.map((i) => i.label)).toEqual([
      'Strona główna',
      'Poznaj Hannę',
      'Usługi',
      'Partnerzy',
      'Bezpłatna konsultacja',
    ]);
  });

  it('preserves the public anchor targets', () => {
    // Root-relative on purpose: a bare "#services" would not leave /about-me.
    const hrefs = navItems.map((i) => i.href);
    expect(hrefs).toContain('/#services');
    expect(hrefs).toContain('/#partners');
    expect(hrefs).toContain('/#contact');
  });

  it('carries 6 services, 5 journey steps, 4 benefits', () => {
    expect(services).toHaveLength(6);
    expect(journeySteps).toHaveLength(5);
    expect(benefits).toHaveLength(4);
  });

  it('carries 13 insurance brands and 9 banks', () => {
    expect(insurancePartners).toHaveLength(13);
    expect(bankPartners).toHaveLength(9);
  });

  it('draws the marquee subset from the partner logo files', () => {
    const known = new Set(
      [...insurancePartners, ...bankPartners].map((p) => p.file)
    );
    expect(marqueePartners).toHaveLength(9);
    expect(marqueePartners.filter((file) => !known.has(file))).toEqual([]);
  });

  it('marks the contact details as placeholders', () => {
    expect(contact.isPlaceholder).toBe(true);
  });
});
