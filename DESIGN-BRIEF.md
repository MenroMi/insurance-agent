# Design Brief / Migration Handoff

**Target:** migrate this vanilla HTML/CSS site to React + Tailwind v4, then apply design work.
**Status:** direction locked, implementation deferred until after migration.
**Produced by:** `design-taste-frontend` sections 0, 1, 11.A, 11.B (audit only, no implementation).
**Date:** 2026-07-26

> Why implementation is deferred: the React app will use Tailwind v4, so the current
> `styles.css` (1145 lines) is discarded wholesale. Polishing it first would be thrown-away work.
> Everything in this file is stack-independent and survives the migration.

---

## 1. Locked decisions

### Design read (section 0.B)

> Redesign (overhaul) of a solo financial-advisor landing for risk-averse Polish consumers
> choosing an insurance or credit product, with a trust-first, calm-institutional language,
> leaning toward Tailwind v4 utilities + a sans display face with full Polish diacritic
> coverage + restrained motion.

Driving signal: section 0.A point 6. Insurance and credit intermediation is a regulated /
trust-first brief, and those constraints override aesthetic preference.

### Dials (section 1)

| Dial | Existing site | Target | Rationale |
|---|---|---|---|
| `DESIGN_VARIANCE` | ~5 | **4** | trust-first row gives 3-4. Keep the asymmetric split hero, drop masonry and large empty zones. |
| `MOTION_INTENSITY` | ~5 | **4** | Table gives 2-3, but this is a Persuade surface, not a public-sector service. 4 is the floor of "Fluid CSS": scroll reveals and hover, no scroll hijack. |
| `VISUAL_DENSITY` | ~3-4 | **4** | trust-first row gives 4-5. Financial content needs corroborating density. |

**Conflict resolved:** section 1.A prescribes `+2 / +2` for overhaul mode, which would give
`7 / 7 / 4`. That collides with the trust-first row `3-4 / 2-3 / 4-5`. Per section 0.A.6 the
quiet constraint wins, so the overhaul modifier was NOT applied.

**Consequence:** `MOTION_INTENSITY: 4` is above 3, so per section 6.B honoring
`prefers-reduced-motion` is mandatory, in "degrade to static" form.

### Mode (section 11.A): Redesign - Overhaul

Not Preserve. Evidence: `README.md` lists the final color palette, logos, photography and the
exact professional title under "Do podmiany" (to be replaced). There is no established brand
to preserve; current tokens are provisional.

Overhaul means: **visual language is open, content and IA are preserved.**

---

## 2. Inherited constraints

### Preserve (section 11.C)

- ~~Anchor IDs unchanged.~~ **Overridden by user decision, 2026-07-26.** URLs and anchor
  fragments are now all English while user-visible copy stays Polish. Section 11.C wanted
  anchors stable for SEO and muscle memory; section 7 of this brief records that there is no
  indexed baseline to protect, so the SEO half of that rationale does not apply here. Mapping:
  `#jak-dzialam` to `#how-it-works`, `#uslugi` to `#services`, `#partnerzy` to `#partners`,
  `#kontakt` to `#contact`, `#top` unchanged.
- Primary nav labels unchanged, in Polish: Strona główna, Poznaj Hannę, Usługi, Partnerzy,
  Bezpłatna konsultacja. Only their `href` targets changed.
- Copy voice unchanged. The restrained, no-pressure register ("bez presji", "czas na decyzję")
  is on-brief for trust-first. Visual modernisation is not a content rewrite.
- Do not regress accessibility already in place: `lang="pl"`, alt text on all 22 logos,
  `aria-expanded` on the nav toggle, `aria-hidden` on duplicated marquee logos.

### Requires explicit approval before changing (section 11.F)

- ~~**URL structure.**~~ **Approved 2026-07-26.** `poznaj-hanne.html` becomes `/about-me`, the
  legal page is `/privacy-policy`, and all anchor fragments are English. The user's stated rule:
  URLs in English, never tied to a person's name; interface copy stays Polish.
- Brand logo / wordmark (currently the "HK" monogram). Still requires approval.
- Legal / consent copy (none exists yet; see open items). Still requires approval.

---

## 3. Current token inventory

Reference values for setting up Tailwind `@theme`. Not a commitment to keep them.

```
primary        #2f78b7      primary-strong #205f96      primary-dark #173d60
accent (gold)  #d1aa68      gold-soft      #f3e5c8
text           #1d2a39      muted          #68788c      line       #dbe4ec
success        #4a936d
page           #f7f9fc      surface        #ffffff
surface-soft   #edf3f8      surface-blue   #eaf4fb

type   DM Sans (body) / Playfair Display (h1, h2) / Manrope (labels, buttons)
logo   "HK" monogram, 42px circle
radii  12 distinct values in use (see retire list item 9)
```

Blue saturation is ~59%, within the section 4.2 limit of 80%.

---

## 4. Retire list

Ordered by weight of violation. Tick during migration.

- [ ] **1. Fake Lendi form built from `<div>`** (`.fake-field`, `.fake-check` "□", dead
      `.widget-button`). Section 9.F calls div-based fake product UI "the #1 LLM-design Tell".
      Hard ban. Either embed the real Lendi widget or use a clearly labeled placeholder slot.
- [x] **2. Nine em-dashes** (7 in `index.html`, 2 in `poznaj-hanne.html`). Section 9.G is zero
      tolerance. Each is a separate Pre-Flight Fail. Replace with period, comma, colon or
      restructure. Note: this ban applies to the Polish page copy, not to internal docs.
- [ ] **3. Twelve eyebrows against a limit of 2.** Section 4.7, described in the skill as the
      most-violated rule. Present: `.eyebrow` x4, `.journey-kicker` x5, `.hero-kicker`,
      `.mini-label`, `.partners-label`. Limit is `ceil(5 sections / 3) = 2`.
- [x] **4. Nine CTAs with one intent, seven distinct labels.** Section 4.5 NO DUPLICATE CTA
      INTENT is a Pre-Flight Fail. All resolve to `#contact`: "Bezpłatna konsultacja",
      "Umów bezpłatną konsultację" x2, "Umów analizę", "Sprawdź możliwości", "Porozmawiajmy",
      "Sprawdź zakres", "Umów konsultację", "Skontaktuj się". Pick ONE label, use it everywhere.
- [ ] **5. Three equal columns of service cards** (6 cards in `repeat(3, 1fr)`). Section 9.C
      bans the generic three-identical-cards row outright.
- [ ] **6. Hero carries 6 text elements against a limit of 4.** Section 4.7. `.hero-facts`
      (17 / 9 / 1 osoba) is a banned trust micro-strip inside the hero. `.hero-disclaimer` is a
      banned tagline below the CTAs. Both move to dedicated sections below the hero.
- [x] **7. Logo marquee sits inside `<section class="hero">`.** Section 4.7: the logo wall
      belongs under the hero, never inside it.
- [ ] **8. Dark section mid-page.** `.consultation-copy` on `--primary-dark` inside an otherwise
      light page breaks the section 4.11 Page Theme Lock.
- [ ] **9. Twelve distinct `border-radius` values** (50%, 999px, 34px, 32px, 30px, 24px, 18px,
      15px, 12px, 10px, 8px, plus one asymmetric). Section 4.4 SHAPE CONSISTENCY LOCK requires
      one documented scale.
- [x] **10. Emoji service icons** (heart, car, house, plane, office, bank). Sections 3.C and 3.D.
      Replace with `@phosphor-icons/react`. Section 9.E forbids hand-rolling SVG instead.
- [x] **11. Google Fonts via `<link>`.** Section 3.A: never in production. `next/font` on migration.
      Also removes the EU data-transfer concern with the Google Fonts CDN.
- [ ] **12. No dark mode.** Section 6.C: mandatory for consumer-facing pages.
- [ ] **13. Placeholder content.** `+48 000 000 000` and `kontakt@twojadomena.pl` in 6 places,
      `href="#"` on the Facebook link, "Miejsce na profesjonalne zdjęcie" in 2 places.
      Section 9.D.

### Batch 2, from `redesign-existing-projects` (diagnose pass)

Stack-independent only. CSS-level fixes were deliberately not applied.

**Visual substance**

- [ ] **14. Zero photography on the entire site.** 22 logo files, 0 photographs. The hero's only
      visual depth is a light gradient plus two blurred `.hero-glow` blobs. `design-taste-frontend`
      section 4.8: "Hero needs a real visual. Text + gradient blob is not a hero, it's a
      placeholder", and even restrained sites need 2-3 real images. This is larger than the two
      portrait slots in section 8.3: the page needs supporting imagery too.
- [ ] **15. No texture anywhere.** Pure flat surfaces. Optional, low priority: a fixed
      `pointer-events-none` noise overlay. Note the section 6.E constraint, never on a scrolling
      container.

**Accessibility and interaction states**

- [x] **16. No `:focus-visible` anywhere.** Zero occurrences in 1146 lines. Keyboard navigation
      falls back to the browser default, which is nearly invisible on the blue `.nav-cta`. The
      skill calls this "an accessibility requirement, not optional".
- [x] **17. No `:active` / pressed feedback.** Zero occurrences. Needs `scale(0.98)` or
      `translateY(1px)` on press.
- [x] **18. No skip-to-content link.** Essential for keyboard users.
- [ ] **19. No loading / empty / error states.** Currently moot because the form is fake, but it
      blocks retire-list item 1: the real Lendi widget needs all three, plus client-side validation.

**Typography detail**

- [x] **20. No `text-wrap: balance` or `pretty`.** Polish headlines run long and produce orphans.
      The h1 wraps to 4 lines at desktop.
- [x] **21. No tabular figures.** The page leans on numbers (17, 9, 1, 0 zł) with proportional
      digits. Add `font-variant-numeric: tabular-nums` where numbers align.
- [x] **22. Body measure set in px, not `ch`.** 700px at 19px runs roughly 75 characters;
      `.section-heading` is 790px. Target is ~65ch.

**Component patterns**

- [ ] **23. Generic card look is pervasive**, border plus shadow plus white background:
      `.service-card`, `.journey-card`, `.fact`, `.cooperation-benefit`, `.partner-group`. The rule:
      cards should exist only where elevation communicates real hierarchy. Elsewhere group with a
      divider or with space.
- [ ] **24. One filled plus one ghost button** in the hero is the default AI pairing. Consider a
      text link as the secondary action.

**Performance**

- [x] **25. `.journey-progress` animates `height`.** The only non-GPU animated property in the
      project (`transition: height .45s ease`, driven from `script.js`). Rebuild as
      `transform: scaleY()` with `transform-origin: top`.

**Legal and completeness (jurisdiction: Poland / EU)**

- [x] **26. No legal links in the footer.** Privacy policy and terms.
- [ ] **27. No cookie consent.** Required once the Lendi widget loads third-party code.
- [x] **28. No custom 404 page.**

### Passed the audit, leave alone

Exactly one marquee (section 5 limit is one per page). Five distinct layout families across five
sections (section 4.7 wants at least four across eight). Hero subtext is 19 words (limit 20).
Logo walls carry no per-logo category labels (section 4.8 LOGO-ONLY). No scroll cues, no version
labels, no locale or weather strips.

### Regression guard: do not lose these in the migration

These already pass and are easy to break while rewriting into Tailwind. Section 11.C requires
honoring existing wins.

| Already correct | Evidence |
|---|---|
| Semantic HTML, no div-soup | 20 semantic elements on `index.html`: `header`, `nav`, `main`, `section`, `article`, `footer` |
| Zero inline styles | no `style="` in either page |
| Tinted shadows, not black | `rgba(24, 61, 96, .12)` carries the page hue |
| Sane z-index scale | max value is 80, no `9999` spam |
| Card CTAs bottom-aligned | `margin-top: auto` on `.service-card a` |
| Current page marked in nav | `.active-link` on both pages |
| Container constrained | `--container: 1180px` via `min()` |
| No `100vh` bug | zero occurrences, so no iOS Safari viewport jump |
| No pure `#000` | zero occurrences |
| Alt text complete | all 22 logos labeled; decorative duplicates correctly `alt="" aria-hidden="true"` |
| Copy is clean | no Lorem Ipsum, no Title Case headers, no "Elevate / Seamless" filler |
| No dead commented-out code | zero commented rule blocks |
| `lang="pl"` set | both pages |
| Nav toggle exposes state | `aria-expanded` maintained in `script.js` |

---

## 5. Keep (section 11.B "patterns to preserve")

- **The 5-step journey timeline.** Strongest block on the page, carries real explanatory value.
- **Asymmetric split hero** composition.
- **Copy voice.** See section 2 above.

## 6. Known filler

The numbers 17 / 9 / 1 appear three times over: `.hero-facts`, `.cooperation-benefits`, and the
partners section headline. Consolidate to one placement.

---

## 7. SEO baseline (section 11.B)

Present: `<title>` and `meta description` on both pages.
Absent: Open Graph, canonical, favicon, structured data, `robots.txt`, `sitemap.xml`.

Section 11.B calls SEO migration the number one redesign risk, but there is no indexed baseline
to lose here. Only the anchor IDs need to survive. Build SEO fresh as a separate task; Next.js
Metadata API covers most of it.

---

## 8. Open decisions, with blockers

> **Deliberately carried through the migration unchanged. Must not ship as-is.**
>
> The migration reproduces the legacy look on purpose, so that visual parity against the
> Task 15 baseline is a meaningful check. That means two pieces of known debt travel into the
> React codebase intact, and both are tracked here rather than left to be noticed later:
>
> | Debt | Where it lives after migration | Owner |
> |---|---|---|
> | Playfair Display as the display face, and three font families instead of two | `src/app/globals.css` `@theme`, `src/app/layout.tsx` | section 8.2 below |
> | All 12 legacy `border-radius` values kept as separate tokens | `src/app/globals.css` `@theme` | retire item 9 in section 4 |
>
> Both carry a `DEFERRED DEBT` comment at the point of definition, so anyone reading the
> stylesheet sees the status without reading this document. Neither is a bug to be reported in
> code review; both are scheduled work.

### 8.1 Single accent color

Section 4.2 allows one accent; the site currently runs blue plus gold. Must pick one.

**Blocked on:** real photography of the advisor. Section 11.B treats brand assets as starting
material, and for a personal-brand advisor site the portrait drives the palette. Decide once the
photo exists.

### 8.2 Display typeface

Direction is settled: sans display, not `Playfair Display`. Section 4.1 SERIF DISCIPLINE requires
an editorial / luxury / publication / heritage justification, and a regulated financial advisory
brief is none of those. Playfair is not in the banned pair (`Fraunces`, `Instrument_Serif`) but it
is not justified either.

**Blocked on:** verifying **full Polish diacritic coverage** (ą ć ę ł ń ó ś ź ż). Several faces in
the section 4.1 pool cover Latin Extended partially or not at all. Coverage per candidate has NOT
been verified. Do this before committing to a face.

**Update (Task 2, 2026-07-26):** Diacritic coverage verified for the three carried-over legacy
faces only (DM Sans / `--font-body`, Playfair Display / `--font-display`, Manrope / `--font-label`),
each loaded via `next/font/google` with the `latin-ext` subset. Rendered `ąćęłńóśźż ĄĆĘŁŃÓŚŹŻ` at
44px in a real Chrome browser (Chrome 150) for all three; every glyph rendered with its correct
diacritic in all three families, no missing or malformed marks. This does NOT resolve the
sans-vs-serif direction above — Playfair Display passing the diacritic check is not a
justification to keep it as the display face. It only confirms none of the three carried-over
faces need to be swapped out on diacritic-coverage grounds alone. No other section 4.1 candidate
faces have been checked yet.

**Separate finding surfaced by this verification, unrelated to typeface choice.**

`@theme` declares `--font-body: var(--font-dm-sans), system-ui, sans-serif` on `:root`. Task 2's
original brief put `next/font`'s CSS variable classes on `<body>`. In that arrangement none of the
three fonts render: every `font-body` / `font-display` / `font-label` utility silently falls back
to the system stack, with no error and no failing test.

**Cause, stated correctly: this is specified CSS behavior, not a browser bug.** An earlier version
of this note described it as a Chrome/Chromium defect "worth re-verifying if a browser update
changes the outcome". That was wrong and is corrected here, because the mistaken framing invites
someone to move the classes back once a browser updates.

The actual mechanism, per the CSS Custom Properties specification: `var()` references inside a
custom property are substituted at computed-value time **on the element where that property is
declared**, not on the element that later inherits and consumes it. `--font-body` is declared on
`:root`, so its `var(--font-dm-sans)` is resolved against `:root`. With the font class on `<body>`,
`--font-dm-sans` is unset at `:root`, so `--font-body` computes to the guaranteed-invalid value,
and it is that invalid value which inherits down the tree. Defining `--font-dm-sans` further down
cannot retroactively repair an ancestor's already-resolved value. The same failure reproduces in
Firefox and Safari; no browser version will change it.

**Fix:** the `next/font` variable classes moved from `<body>` to `<html>` in `src/app/layout.tsx`,
which is the element `:root` refers to, so the referencing and referenced properties are declared
together. No token names, values, or font families changed.

**Standing rule for later tasks:** any additional `next/font` variable goes on `<html>`. More
generally, a custom property and every custom property it references must be declared on the same
element or on an ancestor of it, never on a descendant.

Verified two ways: the controller reproduced both arrangements in a live browser (system stack
with the classes on `<body>`, `"DM Sans", "DM Sans Fallback", system-ui, sans-serif` with them on
`<html>`), and the task reviewer reproduced the cross-element failure and the same-element control
in a minimal standalone case.

### 8.3 Assets and copy the design work depends on

Not design decisions, but they gate "done" in any stack:

- Real phone number and email.
- Professional photography of the advisor (2 slots).
- Official Lendi widget embed code (blocks retire-list item 1, and through it item 27).
- Legal texts: privacy policy and RODO notice. Required once the Lendi widget starts collecting
  personal data. Also section 11.F treats legal copy as never-silently-changed, so it must be
  authored deliberately.
- Cookie consent and the cookie section of the privacy policy (retire item 27). The migration
  plan's Task 16 owns this. It is deliberately not built yet: the site currently sets no cookie
  and loads no third-party code, so there is nothing to consent to, and the obligation starts
  with the Lendi embed. Must not be forgotten before launch; it was missing from the plan's
  scoping split entirely until an audit on 2026-08-25.
- Exact professional title.
- Production domain. `src/content/site.ts` ships `https://example.invalid`; canonical URLs,
  Open Graph URLs, `sitemap.xml` and `robots.txt` all carry it until it is replaced. Task 13
  wired every one of them to `site.baseUrl`, so a single edit fixes all of them at once.
- Structured data is written and tested but publishes NOTHING today, on purpose
  (`src/lib/structuredData.ts`). It is gated on `contact.isPlaceholder` and on the domain
  above, because a `ProfessionalService` record carrying `+48 000 000 000` and
  `example.invalid` is a machine-readable claim about a real business that is false. Both
  gates lift by themselves once the real phone, email and domain land in the content modules;
  no further code change is needed. This closes the section 7 structured-data gap, which the
  migration plan's Task 13 had no step for.

### 8.4 How scroll reveals are driven

The migration ships `src/components/Reveal.tsx` (Task 5), which replaces the legacy
`.reveal { opacity: 0 }` plus single `IntersectionObserver` pattern. It is correct and both hard
constraints are verified by test: content is visible with JavaScript off, and
`prefers-reduced-motion` degrades to static rather than to a zero-length animation. It is not,
however, the cheapest possible mechanism, and the design phase owns the choice.

Cost of the shipped version, measured rather than assumed: `useInView` in `motion` 12.42.2 creates
one `IntersectionObserver` per call (`framer-motion/dist/es/utils/use-in-view.mjs`), and the plan
uses `<Reveal>` in 18 places, against one observer for all 28 elements in the legacy script. In
practice this costs nothing measurable; observers are cheap. It is a tidiness question, not a
performance one.

Two alternatives, either of which is a change to that one file, because all 18 call sites only
touch the `children` / `delay` / `className` API:

- **One shared observer.** A subscription-based hook in place of an observer per instance, roughly
  40 lines. Same public API, same behavior, 17 fewer objects.
- **No JavaScript at all: `animation-timeline: view()`.** Scroll-driven reveals in pure CSS, no
  hydration, wrapped in `@supports` so that unsupporting browsers simply get static content, which
  is the same fallback reduced motion already gets. **Blocked on:** checking current browser
  support against real data at decision time, not from memory. If support is acceptable, this
  removes the primitive entirely.

Decide during the design phase, when motion is being looked at as a whole. Nothing about this is
urgent and nothing else depends on it.

---

## 9. Carried over from the earlier cleanup pass

Fixed already (see git history once committed): 21 MB of stray files removed, three broken logo
paths repaired, "Strong główna" typo, `scroll-padding-top` for the sticky header, dead CSS removed.

Still open and stack-independent:

- [x] **Content is invisible without JS.** `.reveal { opacity: 0 }` is cleared only by
      `script.js`. Any script error hides the hero, services and partners. In React this becomes
      a Motion `initial`/`whileInView` concern; the equivalent trap exists there. Section 5.C
      canonical skeleton handles it via `initial={reduce ? false : ...}`.
- [x] **Reduced-motion implementation needs rework.** The blanket
      `transition-duration: .01ms` block is gone; `globals.css` now only resets
      `scroll-behavior`, and each moving piece handles the preference itself
      (`Reveal`, `JourneyTrack`, `PartnerMarquee`), degrading to static rather than to a
      zero-length animation. Ticked on that basis. The finer "gentler, not zero: keep
      opacity/color, drop movement" refinement is motion design and belongs to the design
      phase, together with section 8.4.

---

## 10. Deliberately NOT in this file

- Implementation guidance. Sections 3.A-3.C, 5.A-5.C and 12 of `design-taste-frontend` only apply
  once React and Tailwind exist.
- Animation fix plans. `improve-animations` writes plans citing exact file paths and code
  excerpts; against the discarded `styles.css` they would be stale on arrival. Run it after
  migration.
- The stack-independent omissions sweep (favicon, legal links, 404, skip-link, OG) has RUN. Its
  findings are section 4's Batch 2, items 14 to 28, and every one of them that the migration took
  in scope is now ticked there.
