import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = join(import.meta.dirname, '..', '..');

export const legacyLabels = {
  home: [
    'Konsultacje online i stacjonarnie w Zielonej Górze',
    'Wybrani partnerzy',
    'Jak wygląda współpraca',
    'Zakres usług',
    'Zakres współpracy',
    'Bezpłatna konsultacja',
    'Twój doradca',
    'Pierwszy kontakt',
    'Analiza potrzeb',
    'Porównanie rozwiązań',
    'Wspólna decyzja',
    'Opieka po zakupie',
  ],
  about: ['Poznaj Hannę', 'Jak pracuję', 'Bezpłatna konsultacja'],
} as const;

const LABEL_CLASSES =
  'eyebrow|hero-kicker|partners-label|journey-kicker|mini-label';

/** Re-derives the label list from a legacy HTML file, or null once it is gone. */
export function legacyLabelsFromHtml(file: string): string[] | null {
  const path = join(repoRoot, file);
  if (!existsSync(path)) return null;

  const html = readFileSync(path, 'utf8');
  // The tag name is captured and back-referenced so the match runs to the
  // element's OWN closing tag. `.hero-kicker` is a div wrapping a decorative
  // <span>, and a non-greedy `</[a-z]+>` would stop at that span instead,
  // yielding an empty label.
  const pattern = new RegExp(
    `<([a-z]+) class="(?:${LABEL_CLASSES})"[^>]*>((?:(?!</\\1>)[\\s\\S])*)</\\1>`,
    'g'
  );

  return [...html.matchAll(pattern)]
    .map((m) =>
      m[2]
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter(Boolean);
}

/** Every .ts/.tsx file under src/, as [relative path, contents]. */
export function sourceFiles(): Array<[string, string]> {
  const out: Array<[string, string]> = [];

  const walk = (dir: string) => {
    for (const entry of readdirSync(join(repoRoot, dir), {
      withFileTypes: true,
    })) {
      const rel = `${dir}/${entry.name}`;
      if (entry.isDirectory()) walk(rel);
      else if (/\.tsx?$/.test(entry.name))
        out.push([rel, readFileSync(join(repoRoot, rel), 'utf8')]);
    }
  };

  walk('src');
  return out;
}
