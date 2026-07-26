export const journeySteps = [
  {
    n: 1,
    kicker: 'Pierwszy kontakt',
    title: 'Krótka rozmowa o tym, czego potrzebujesz',
    body: 'Ustalamy temat, cel i to, czy potrzebna jest pełna analiza, czy prostsza ścieżka.',
    tags: ['bez zobowiązań', 'online lub stacjonarnie'],
  },
  {
    n: 2,
    kicker: 'Analiza potrzeb',
    title: 'Porządkujemy Twoją sytuację',
    body: 'Sprawdzamy zobowiązania, aktualne rozwiązania, priorytety i najważniejsze ryzyka.',
    tags: ['bez sztucznych scoringów', 'konkretne pytania'],
  },
  {
    n: 3,
    kicker: 'Porównanie rozwiązań',
    title: 'Otrzymujesz dostępne warianty i jasne różnice',
    body: 'Zakres, koszty, warunki i ograniczenia przedstawione w prosty sposób.',
    tags: ['17 firm ubezpieczeniowych', '9 banków'],
  },
  {
    n: 4,
    kicker: 'Wspólna decyzja',
    title: 'Wybierasz rozwiązanie dopasowane do siebie',
    body: 'Decyzja należy do Ciebie. Pomagam zrozumieć konsekwencje każdego wariantu.',
    tags: ['bez presji', 'czas na decyzję'],
  },
  {
    n: 5,
    kicker: 'Opieka po zakupie',
    title: 'Kontakt nie kończy się po zawarciu umowy',
    // Legacy used an em-dash before "przy"; replaced with a comma per the
    // zero-dash Global Constraint. One of the 9 dash sites.
    body: 'Możesz wrócić z pytaniami również później, przy zmianie sytuacji lub potrzeb.',
    tags: ['jedna osoba do kontaktu', 'ciągłość obsługi'],
  },
] as const;
