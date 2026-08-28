import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AboutPage from '@/app/about-me/page';
import NotFound from '@/app/not-found';
import HomePage from '@/app/page';
import PrivacyPage from '@/app/privacy-policy/page';
import { collectStrings, findDashViolations } from '../helpers/dashGuard';
import { renderedText } from '../helpers/renderedText';
import {
  legacyLabels,
  legacyLabelsFromHtml,
  sourceFiles,
} from '../helpers/legacySource';

/*
 * Site-wide guards for the defect classes the migration plan produced more than
 * once. Per-section tests catch a defect in the section being written; these
 * catch it anywhere, including in the sections still to come (Tasks 12 to 15).
 */

/*
 * `labels` is empty for the two routes added by Task 12: retire items 26 and 28
 * mean they have no legacy counterpart, so there is nothing to have dropped.
 * The dash and slug guards below apply to them exactly as to the ported pages.
 */
const pages = [
  { name: 'home', node: <HomePage />, labels: legacyLabels.home },
  { name: 'about-me', node: <AboutPage />, labels: legacyLabels.about },
  { name: '404', node: <NotFound />, labels: [] },
  { name: 'privacy-policy', node: <PrivacyPage />, labels: [] },
] as const;

describe.each(pages)('$name page', ({ node, labels }) => {
  it('keeps every legacy eyebrow, kicker and micro-label', () => {
    const text = renderedText(render(node).container);
    expect(labels.filter((label) => !text.includes(label))).toEqual([]);
  });

  it('carries no em-dash or en-dash', () => {
    const text = renderedText(render(node).container);
    expect(findDashViolations(collectStrings(text))).toEqual([]);
  });

  it('never lets an English URL slug reach the Polish prose', () => {
    const text = renderedText(render(node).container);
    // Global Constraints: kontakt, partnerzy and usługi are ordinary Polish
    // words as well as former slugs. The renames stay in hrefs only.
    expect(text).not.toMatch(/\b(contact|partners|services|about-me)\b/i);
  });
});

describe('legacy label list', () => {
  // Task 15 deletes the legacy files; this cross-check retires itself with them
  // rather than failing. Until then it keeps the hardcoded list honest.
  it.each([
    ['index.html', legacyLabels.home],
    ['poznaj-hanne.html', legacyLabels.about],
  ])('matches %s while that file still exists', (file, expected) => {
    const derived = legacyLabelsFromHtml(file);
    if (derived === null) return;
    expect([...new Set(derived)].sort()).toEqual([...new Set(expected)].sort());
  });
});

describe('Tailwind arbitrary values', () => {
  it('never mixes a gradient and a bare colour in one bg-[...]', () => {
    // Tailwind cannot type such a value and emits NO rule at all: no build
    // error, no failing unit test, just an unpainted element. The plan shipped
    // this in Task 10 and again in Task 11.
    const offenders = sourceFiles().flatMap(([path, body]) =>
      [...body.matchAll(/bg-\[(?!image:)([^\]]*)\]/g)]
        .filter(([, value]) => {
          const hasGradient = /gradient\(/.test(value);
          const bareColour = /,\s*(var\(--|#|rgb\(|rgba\(|hsl\()/.test(
            value.replace(/gradient\([^)]*\)/g, '')
          );
          return hasGradient && bareColour;
        })
        .map(([match]) => `${path}: ${match}`)
    );

    expect(offenders).toEqual([]);
  });

  it('never sizes anything to the static full viewport height', () => {
    // Brief regression guard: the static full-viewport unit has zero
    // occurrences, so the site has no iOS Safari viewport jump. Tailwind's
    // `screen` scale resolves to exactly that unit, so the utility form
    // reintroduces the bug silently. The sticky footer in layout.tsx uses the
    // dynamic unit, which tracks the collapsing browser chrome instead.
    //
    // Scanned over className values only, not raw file text: a prose comment
    // naming the unit it forbids is not a violation, and the first version of
    // this guard failed on its own explanation.
    const offenders = sourceFiles().flatMap(([path, body]) =>
      [...body.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)]
        .map(([, quoted, templated]) => quoted ?? templated ?? '')
        .flatMap((classes) =>
          [...classes.matchAll(/\b(?:min-h|max-h|h)-screen\b|100vh/g)].map(
            ([match]) => `${path}: ${match}`
          )
        )
    );

    expect(offenders).toEqual([]);
  });
});

describe('commented-out code', () => {
  it('leaves no dead code behind in a comment', () => {
    // Brief regression guard: the legacy CSS had zero commented-out rule
    // blocks, and the migration must not introduce the habit.
    //
    // Backtick-quoted spans are stripped first. This codebase quotes code
    // inside prose deliberately and often, for example the comment in
    // Reveal.tsx that names the legacy `.reveal { opacity: 0 }` trap it exists
    // to prevent. Flagging that would be flagging documentation, and a guard
    // that fires on good comments gets deleted rather than obeyed.
    const commentPattern = /\/\*[\s\S]*?\*\/|\/\/[^\n]*/g;

    const offenders = sourceFiles().flatMap(([path, body]) =>
      (body.match(commentPattern) ?? [])
        .map((comment) => comment.replace(/`[^`]*`/g, ''))
        .filter(
          (comment) =>
            /className=/.test(comment) ||
            /[.#\w][\w-]*\s*\{[^}]*:[^}]*;[^}]*\}/.test(comment)
        )
        .map(
          (comment) => `${path}: ${comment.slice(0, 60).replace(/\s+/g, ' ')}`
        )
    );

    expect(offenders).toEqual([]);
  });
});

describe('heading typography', () => {
  const headings = () =>
    sourceFiles().flatMap(([path, body]) =>
      [...body.matchAll(/<(h[1-3])\s+className="([^"]*)"/g)].map(
        ([, tag, classes]) => ({ path, tag, classes })
      )
    );

  it('renders h1 and h2 as the bold display face, like the legacy rule', () => {
    // styles.css line 45: h1, h2 { font-family: "Playfair Display" }. Weight
    // comes from the browser default, which Tailwind Preflight resets to
    // inherit, so it has to be stated explicitly here.
    const wrong = headings()
      .filter((h) => h.tag !== 'h3')
      .filter(
        (h) =>
          !h.classes.includes('font-display') ||
          !h.classes.includes('font-bold')
      )
      .map((h) => `${h.path}: <${h.tag}>`);

    expect(wrong).toEqual([]);
  });

  it('renders h3 as the bold body face, because the legacy rule excludes h3', () => {
    // The same rule lists only h1 and h2, so every legacy h3 is DM Sans 700.
    const wrong = headings()
      .filter((h) => h.tag === 'h3')
      .filter(
        (h) =>
          h.classes.includes('font-display') || !h.classes.includes('font-bold')
      )
      .map((h) => `${h.path}: <${h.tag}>`);

    expect(wrong).toEqual([]);
  });
});
