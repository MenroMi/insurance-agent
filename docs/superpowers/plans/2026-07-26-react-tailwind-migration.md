# React + Tailwind v4 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the existing 2-page vanilla HTML/CSS site to Next.js + Tailwind v4 with byte-faithful content, unchanged IA, and the cheap correctness/a11y/legal wins folded in, producing a verified baseline for the design phase.

**Architecture:** Next.js 15 App Router, statically rendered. All page copy moves out of markup into typed modules under `content/`, so duplication (contact placeholders, the repeated 17/9/1 figures) becomes visible and single-sourced. Design tokens from `DESIGN-BRIEF.md` section 3 land in a Tailwind v4 `@theme` block. The migration is deliberately **visually faithful**: same fonts, same palette, same composition. That is what makes it verifiable. Aesthetic change happens afterwards, on a green baseline.

**Tech Stack:** Next.js 15 (App Router, TypeScript), Tailwind v4 via `@tailwindcss/postcss`, `motion` (`motion/react`), `@phosphor-icons/react` 2.1.10, `next/font/google`, Vitest + React Testing Library (component behavior), Playwright (regression guard).

## Component architecture

Two decisions, recorded explicitly because they are choices rather than framework requirements.

**What Next.js actually mandates:** the routing conventions inside `app/` (folder name equals URL segment; the reserved files `page.tsx`, `layout.tsx`, `not-found.tsx`, `sitemap.ts`, `robots.ts`, `icon.svg`) and the Server/Client boundary. Nothing else. The `content/`, `lib/` and `components/` folders are this project's invention.

**Decision 1, file layout: hybrid colocation.** Shared building blocks live in top-level `components/`. Anything used by exactly one route lives next to that route in `app/<route>/_components/`. The leading underscore is a Next convention that opts the folder out of routing. The point is that the folder a component sits in tells you whether it is safe to change: touching `app/_components/Hero.tsx` cannot affect `/poznaj-hanne`, and touching `components/Reveal.tsx` can affect everything.

**Decision 2, the Server/Client boundary.** Server Components by default. `"use client"` appears only on the smallest possible leaf that genuinely needs browser APIs, and server-rendered markup reaches those leaves as `children`.

Only three files in this plan carry `"use client"`:

| Client leaf | Why it must be | What stays on the server |
|---|---|---|
| `components/SiteHeader.tsx` | `useState` for the mobile menu, `usePathname` for the active link | nothing; the header is small |
| `components/Reveal.tsx` | `useInView` plus a post-hydration mount flag | **all of its `children`**, which is why the no-JavaScript test in Task 14 can pass |
| `app/_components/JourneyTrack.tsx` | `useScroll` and `useSpring` for the progress bar | the five step cards, passed in as `children` |

A Client Component cannot import a Server Component, but it can receive server-rendered JSX through props. That single fact is what keeps the client bundle to a menu toggle, a viewport observer and a scroll spring.

Two consequences worth stating, because the obvious implementation gets both wrong:

- **`Services` is a Server Component.** Phosphor's default entry point is client-only, which would drag six cards of static markup into the bundle. Version 2.1.10 exposes a server-safe entry at `@phosphor-icons/react/ssr` (verified against the package's export map). Task 8 imports from there.
- **`Journey` is a Server Component** that wraps its steps in a thin `JourneyTrack` client leaf. Marking the whole section `"use client"` would ship five step cards, four benefit cards and a sticky column as client code so that one gradient bar could animate. `design-taste-frontend` section 3.A states the rule directly: any component using Motion, scroll listeners or pointer physics must be an isolated leaf.

## Scoping decision: what this migration does NOT do

`DESIGN-BRIEF.md` carries a 30-item retire list. Doing all of it here would mean designing, which is explicitly deferred. The list is split:

**In scope (stack-level, non-aesthetic, cheap):** items 2 (em-dashes), 4 (CTA label unification), 7 (marquee out of hero), 10 (Phosphor icons), 11 (`next/font`), 16 (`:focus-visible`), 17 (`:active`), 18 (skip-link), 20 (`text-wrap`), 21 (tabular figures), 22 (`ch` measure), 25 (GPU-safe progress), 26 (legal links), 28 (404). Plus the SEO gaps from brief section 7.

**Out of scope, deferred to the design phase:** items 1 (Lendi widget, blocked on real embed code), 3 (eyebrow reduction), 5 (3-column cards), 6 (hero recomposition), 8 (theme lock), 9 (radius scale consolidation), 12 (dark mode), 13 (real contacts, blocked), 14 and 15 (photography, blocked on assets), 19 (form states, blocked on item 1), 23 (card look), 24 (button pairing).

**Out of this plan entirely, tracked as a separate feature:** item 27 (cookie consent). Found on 2026-08-25 by an audit: it was the only item in the retire list that neither bucket above covered. It was briefly carried here as Task 16, then moved out by user decision on 2026-08-28, because it adds behaviour the legacy site never had rather than porting anything, and it is blocked on external work with its own release cycle. Its scope and blockers now live in `DESIGN-BRIEF.md` section 8.3.

Item 9 is partially handled: the 12 radius values get encoded as `@theme` tokens so consolidating them later is a token edit, not a sweep.

**Assumption requiring confirmation:** Next.js rather than Vite + React. Rationale: `DESIGN-BRIEF.md` depends on the Metadata API (section 7 SEO gaps), `next/font` (retire item 11, which also removes the Google Fonts CDN data-transfer concern), and `next/image` (items 14 and 15). With Vite this plan changes: add `react-router` and a head-management library, hand-roll `@font-face` self-hosting, drop Tasks 13's metadata approach, and lose static prerendering. **Confirm before starting Task 1.**

---

## Global Constraints

Copied verbatim from `DESIGN-BRIEF.md`. Every task's requirements implicitly include this section.

- **Anchor IDs unchanged:** `#top`, `#jak-dzialam`, `#uslugi`, `#partnerzy`, `#kontakt`.
- **Primary nav labels unchanged:** `Strona główna`, `Poznaj Hannę`, `Usługi`, `Partnerzy`, `Bezpłatna konsultacja`.
- **Copy voice unchanged.** Visual modernisation is not a content rewrite. Port Polish strings character for character except where a task explicitly says otherwise.
- **Zero em-dashes (`—`) and zero en-dashes (`–`) in any user-visible string.** Non-negotiable per brief retire item 2. Permitted dash characters: regular hyphen `-` only.
- **`lang="pl"` on the html element.**
- **`prefers-reduced-motion` honored in "degrade to static" form**, not by zeroing transition durations. `MOTION_INTENSITY: 4` is above 3, so this is mandatory.
- **Do not regress the 14 items in the brief's "Regression guard" table.** Task 14 encodes them as automated assertions.
- **URL structure:** `poznaj-hanne.html` becomes `/poznaj-hanne`. This is a URL change flagged in brief section 2 as requiring explicit approval. Confirm before Task 11.
- **Polish diacritics:** every font must load the `latin-ext` subset. Brief section 8.2 records that per-face coverage was never verified; `latin-ext` is the mechanism, Task 2 Step 4 is the verification.
- **Node 24.17.0, npm 11.13.0** confirmed present.

---

## File Structure

`[c]` marks a Client Component. Everything unmarked is a Server Component.

```
app/
  layout.tsx                    root html/body, fonts, metadata base, shell
  page.tsx                      Strona główna, composes the home sections
  globals.css                   Tailwind import + @theme tokens + base layer
  not-found.tsx                 custom 404 (retire item 28)
  sitemap.ts                    generated sitemap
  robots.ts                     generated robots.txt
  icon.svg                      favicon monogram
  _components/                  used only by the home route
    Hero.tsx
    PartnerMarquee.tsx          sibling of Hero, not child (retire item 7)
    Journey.tsx                 wraps its steps in JourneyTrack
    JourneyTrack.tsx      [c]   useScroll progress, steps arrive as children
    Services.tsx                Phosphor icons via the /ssr entry
    Partners.tsx                two logo grids
    Consultation.tsx            Lendi placeholder slot
  poznaj-hanne/
    page.tsx                    advisor page
    _components/                used only by this route
      AboutHero.tsx
      AboutWorking.tsx
  polityka-prywatnosci/
    page.tsx                    legal placeholder (retire item 26)
components/                     shared across routes
  SiteHeader.tsx          [c]   nav toggle, active link
  SiteFooter.tsx
  SkipLink.tsx
  Reveal.tsx              [c]   scroll reveal, children stay server-rendered
content/
  nav.ts                        nav items, single source for labels
  contact.ts                    phone/email/location, single source
  services.ts                   6 service entries
  journey.ts                    5 journey steps
  partners.ts                   13 insurance + 9 bank + marquee subset
  benefits.ts                   4 benefit cards
  site.ts                       site name, description, base URL
lib/
  assertNoEmDash.ts             shared guard used by content tests
public/
  logos/                        22 files, git mv from assets/logos
tests/
  unit/                         Vitest + RTL
  e2e/regression-guard.spec.ts  Playwright, encodes the brief's regression guard
```

Split rationale: content modules are separated from presentation because the brief's deferred design work will rewrite every component while leaving copy untouched. Route-specific components sit beside their route so the folder itself records the blast radius of a change; only genuinely shared pieces earn a place in top-level `components/`.

**Testing split:** Vitest + RTL covers client components and content invariants. Page-level and cross-cutting assertions go to Playwright, because async server components are awkward to render in jsdom. Do not fight that boundary.

---

### Task 1: Scaffold Next.js, Tailwind v4 and test tooling

Scaffolded by hand rather than `create-next-app`, because the directory is non-empty (the legacy site and git history stay in place until Task 15) and `create-next-app` aborts on conflicts.

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `vitest.config.ts`, `tests/setup.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.gitignore` (modify)
- Test: `tests/unit/smoke.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: a runnable Next app with `npm run dev`, `npm run build`, `npm test`, `npm run test:e2e`. Path alias `@/*` maps to repo root.

- [ ] **Step 1: Install dependencies**

```bash
cd /Users/c.szczesny/PROGRAMMING_LEARN/outside_projects/hanna-insurances
npm init -y
npm i next@15 react@19 react-dom@19 motion @phosphor-icons/react
npm i -D typescript @types/react @types/react-dom @types/node \
  tailwindcss @tailwindcss/postcss postcss \
  vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Write `package.json` scripts**

Replace the `scripts` block in `package.json` with:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 3: Write config files**

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

`postcss.config.mjs` (note: `@tailwindcss/postcss`, never the bare `tailwindcss` plugin, per Tailwind v4):

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

`tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Append Next.js entries to `.gitignore`**

Append to the existing `.gitignore`:

```
# Next.js
/.next/
/out/
next-env.d.ts

# Testing
/test-results/
/playwright-report/
/blob-report/
```

- [ ] **Step 5: Write the minimal app shell**

`app/globals.css`:

```css
@import "tailwindcss";
```

`app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hanna Khudziakova",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
```

`app/page.tsx`:

```tsx
export default function HomePage() {
  return <h1 className="text-3xl font-bold">Hanna Khudziakova</h1>;
}
```

- [ ] **Step 6: Write the failing smoke test**

`tests/unit/smoke.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "@/app/page";

describe("scaffold", () => {
  it("renders the home page heading", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Hanna Khudziakova",
    );
  });
});
```

- [ ] **Step 7: Run the test suite**

Run: `npm test`
Expected: 1 passed. If it fails with a module-resolution error on `@/app/page`, the `resolve.alias` block in `vitest.config.ts` is wrong.

- [ ] **Step 8: Verify the build and that Tailwind is wired**

Run: `npm run build`
Expected: build succeeds, output lists `/` as a static route.

Run: `npm run dev`, open `http://127.0.0.1:3000`, confirm the heading renders large and bold (proves the Tailwind pipeline processes `text-3xl font-bold`). Stop the server.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "build: scaffold Next.js 15, Tailwind v4 and test tooling"
```

---

### Task 2: Design tokens and fonts

**Files:**
- Modify: `app/globals.css`, `app/layout.tsx`
- Create: `tests/e2e/tokens.spec.ts`

**Interfaces:**
- Consumes: Task 1's `globals.css` and `layout.tsx`.
- Produces: Tailwind utilities `bg-page`, `text-ink`, `text-muted`, `border-line`, `bg-primary`, `text-primary`, `bg-surface`, `bg-surface-soft`, `bg-surface-blue`, `text-accent`, `bg-accent-soft`, `text-success`, `rounded-md|lg|xl|pill`, `font-body`, `font-display`, `font-label`, `shadow-card`, `shadow-card-soft`. CSS variables `--font-dm-sans`, `--font-playfair`, `--font-manrope` on `<body>`.

Token values are copied from `DESIGN-BRIEF.md` section 3. The name `ink` is used instead of `text` because `text` collides with Tailwind's `text-*` utility namespace.

- [ ] **Step 1: Write the `@theme` block**

Replace `app/globals.css` entirely:

```css
@import "tailwindcss";

@theme {
  /* Colors: copied from DESIGN-BRIEF.md section 3 */
  --color-primary: #2f78b7;
  --color-primary-strong: #205f96;
  --color-primary-dark: #173d60;
  --color-accent: #d1aa68;
  --color-accent-soft: #f3e5c8;
  --color-ink: #1d2a39;
  --color-muted: #68788c;
  --color-line: #dbe4ec;
  --color-success: #4a936d;
  --color-page: #f7f9fc;
  --color-surface: #ffffff;
  --color-surface-soft: #edf3f8;
  --color-surface-blue: #eaf4fb;

  /* Radii: the 12 values from the legacy CSS. Consolidation is a design-phase
     job (DESIGN-BRIEF.md retire item 9). Tokenised here, not yet unified. */
  --radius-sm: 8px;
  --radius-md: 10px;
  --radius-lg: 15px;
  --radius-xl: 18px;
  --radius-2xl: 24px;
  --radius-3xl: 30px;
  --radius-4xl: 32px;
  --radius-5xl: 34px;
  --radius-pill: 999px;

  /* Shadows: tinted with the page hue, never black (regression guard) */
  --shadow-card: 0 22px 70px rgb(24 61 96 / 0.12);
  --shadow-card-soft: 0 12px 36px rgb(24 61 96 / 0.07);

  /* Container */
  --container-site: 1180px;

  /* Font families, injected by next/font */
  --font-body: var(--font-dm-sans), system-ui, sans-serif;
  --font-display: var(--font-playfair), Georgia, serif;
  --font-label: var(--font-manrope), sans-serif;
}

@layer base {
  html {
    scroll-behavior: smooth;
    /* sticky header height (78px) plus breathing room */
    scroll-padding-top: 96px;
  }

  body {
    background-color: var(--color-page);
    color: var(--color-ink);
    font-family: var(--font-body);
    line-height: 1.6;
  }

  /* Retire item 16: visible focus for keyboard navigation */
  :focus-visible {
    outline: 2px solid var(--color-primary-dark);
    outline-offset: 3px;
    border-radius: 2px;
  }

  /* Retire item 20: no orphans in the long Polish headlines */
  h1, h2, h3 {
    text-wrap: balance;
  }

  p {
    text-wrap: pretty;
  }

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
  }
}
```

- [ ] **Step 2: Wire the fonts through `next/font`**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { DM_Sans, Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";

// The latin-ext subset is required for Polish diacritics
// (a c e l n o s z z). See DESIGN-BRIEF.md section 8.2.
const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hanna Khudziakova",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body
        className={`${dmSans.variable} ${playfair.variable} ${manrope.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Write the failing token test**

`tests/e2e/tokens.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("theme tokens resolve to the brief's values", async ({ page }) => {
  await page.goto("/");
  const body = page.locator("body");

  await expect(body).toHaveCSS("background-color", "rgb(247, 249, 252)"); // --color-page
  await expect(body).toHaveCSS("color", "rgb(29, 42, 57)"); // --color-ink
});

test("focus-visible produces a visible outline", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const a = document.createElement("a");
    a.href = "#top";
    a.id = "probe";
    a.textContent = "probe";
    document.body.append(a);
  });
  await page.keyboard.press("Tab");
  const outlineWidth = await page
    .locator("#probe")
    .evaluate((el) => getComputedStyle(el).outlineWidth);
  expect(outlineWidth).toBe("2px");
});
```

Create `playwright.config.ts`:

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: "http://127.0.0.1:3000" },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 4: Run the tests and verify Polish diacritics render**

Run: `npm run test:e2e -- tokens.spec.ts`
Expected: 2 passed.

Then verify diacritics manually, which the brief flagged as unverified:

```bash
npm run dev
```

Open `http://127.0.0.1:3000`, replace the heading text in devtools with `ąćęłńóśźż ĄĆĘŁŃÓŚŹŻ` and confirm every glyph renders with its diacritic in all three families (switch `font-family` between `var(--font-body)`, `var(--font-display)`, `var(--font-label)`). Any missing glyph means that face must be replaced; record the outcome in `DESIGN-BRIEF.md` section 8.2. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Tailwind v4 theme tokens and self-hosted fonts"
```

---

### Task 3: Content modules and the em-dash guard

This is where Global Constraint "zero em-dashes" becomes mechanically enforced instead of hoped for.

**Files:**
- Create: `lib/assertNoEmDash.ts`, `content/site.ts`, `content/nav.ts`, `content/contact.ts`, `content/services.ts`, `content/journey.ts`, `content/partners.ts`, `content/benefits.ts`
- Test: `tests/unit/content.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `collectStrings(value: unknown): string[]`
  - `findDashViolations(strings: string[]): string[]`
  - `site: { name: string; role: string; description: string; baseUrl: string }`
  - `navItems: ReadonlyArray<{ label: string; href: string }>`
  - `contact: { phone: string; phoneHref: string; email: string; location: string; isPlaceholder: true }`
  - `services: ReadonlyArray<{ id: string; icon: ServiceIconName; title: string; body: string }>` where `ServiceIconName = "heart" | "car" | "house" | "airplane" | "building" | "bank"`
  - `journeySteps: ReadonlyArray<{ n: number; kicker: string; title: string; body: string; tags: readonly string[] }>`
  - `insurancePartners` and `bankPartners`, both `ReadonlyArray<{ name: string; file: string }>`
  - `benefits: ReadonlyArray<{ figure: string; label: string; body: string }>`

- [ ] **Step 1: Write the dash guard**

`lib/assertNoEmDash.ts`:

```ts
/** Collects every string from an arbitrarily nested data structure. */
export function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

/** Returns strings containing an em-dash or en-dash. See Global Constraints. */
export function findDashViolations(strings: string[]): string[] {
  return strings.filter((s) => s.includes("—") || s.includes("–"));
}
```

- [ ] **Step 2: Write the failing content test**

`tests/unit/content.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { collectStrings, findDashViolations } from "@/lib/assertNoEmDash";
import { navItems } from "@/content/nav";
import { services } from "@/content/services";
import { journeySteps } from "@/content/journey";
import { bankPartners, insurancePartners } from "@/content/partners";
import { benefits } from "@/content/benefits";
import { contact } from "@/content/contact";
import { site } from "@/content/site";

const everything = {
  site,
  navItems,
  contact,
  services,
  journeySteps,
  insurancePartners,
  bankPartners,
  benefits,
};

describe("content invariants", () => {
  it("contains zero em-dashes and en-dashes", () => {
    expect(findDashViolations(collectStrings(everything))).toEqual([]);
  });

  it("preserves the five nav labels verbatim", () => {
    expect(navItems.map((i) => i.label)).toEqual([
      "Strona główna",
      "Poznaj Hannę",
      "Usługi",
      "Partnerzy",
      "Bezpłatna konsultacja",
    ]);
  });

  it("preserves the public anchor targets", () => {
    const hrefs = navItems.map((i) => i.href);
    expect(hrefs).toContain("#uslugi");
    expect(hrefs).toContain("#partnerzy");
    expect(hrefs).toContain("#kontakt");
  });

  it("carries 6 services, 5 journey steps, 4 benefits", () => {
    expect(services).toHaveLength(6);
    expect(journeySteps).toHaveLength(5);
    expect(benefits).toHaveLength(4);
  });

  it("carries 13 insurance brands and 9 banks", () => {
    expect(insurancePartners).toHaveLength(13);
    expect(bankPartners).toHaveLength(9);
  });

  it("marks the contact details as placeholders", () => {
    expect(contact.isPlaceholder).toBe(true);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- content`
Expected: FAIL, cannot resolve `@/content/nav` and siblings.

- [ ] **Step 4: Write the content modules**

`content/site.ts`:

```ts
export const site = {
  name: "Hanna Khudziakova",
  role: "Ubezpieczenia i finanse",
  description:
    "Hanna Khudziakova, konsultacje w zakresie ubezpieczeń i finansowania. Współpraca z 17 firmami ubezpieczeniowymi oraz 9 bankami.",
  baseUrl: "https://example.invalid",
} as const;
```

`baseUrl` is a deliberate placeholder; Task 13 Step 5 records it as blocked on the real domain.

`content/nav.ts`:

```ts
export const navItems = [
  { label: "Strona główna", href: "/" },
  { label: "Poznaj Hannę", href: "/poznaj-hanne" },
  { label: "Usługi", href: "/#uslugi" },
  { label: "Partnerzy", href: "/#partnerzy" },
  { label: "Bezpłatna konsultacja", href: "/#kontakt" },
] as const;
```

`content/contact.ts`:

```ts
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
```

`content/services.ts`:

```ts
export type ServiceIconName =
  | "heart"
  | "car"
  | "house"
  | "airplane"
  | "building"
  | "bank";

export const services = [
  {
    id: "zycie",
    icon: "heart",
    title: "Ubezpieczenia na życie",
    body: "Ochrona rodziny, dochodu, kredytu oraz zabezpieczenie na wypadek poważnych zdarzeń.",
  },
  {
    id: "samochod",
    icon: "car",
    title: "Samochód",
    body: "OC, AC, assistance i NNW z porównaniem zakresu oraz warunków.",
  },
  {
    id: "dom",
    icon: "house",
    title: "Dom i mieszkanie",
    body: "Ochrona nieruchomości, wyposażenia oraz odpowiedzialności cywilnej.",
  },
  {
    id: "podroze",
    icon: "airplane",
    title: "Podróże",
    body: "Zakres dopasowany do kierunku, długości wyjazdu i planowanych aktywności.",
  },
  {
    id: "firma",
    icon: "building",
    title: "Firma",
    body: "OC działalności, majątek, pracownicy i ochrona właściciela firmy.",
  },
  {
    id: "kredyty",
    icon: "bank",
    title: "Kredyty i finansowanie",
    body: "Możliwości dostępne w ramach współpracy z dziewięcioma bankami oraz Lendi.",
  },
] as const satisfies ReadonlyArray<{
  id: string;
  icon: ServiceIconName;
  title: string;
  body: string;
}>;
```

`content/journey.ts`:

```ts
export const journeySteps = [
  {
    n: 1,
    kicker: "Pierwszy kontakt",
    title: "Krótka rozmowa o tym, czego potrzebujesz",
    body: "Ustalamy temat, cel i to, czy potrzebna jest pełna analiza, czy prostsza ścieżka.",
    tags: ["bez zobowiązań", "online lub stacjonarnie"],
  },
  {
    n: 2,
    kicker: "Analiza potrzeb",
    title: "Porządkujemy Twoją sytuację",
    body: "Sprawdzamy zobowiązania, aktualne rozwiązania, priorytety i najważniejsze ryzyka.",
    tags: ["bez sztucznych scoringów", "konkretne pytania"],
  },
  {
    n: 3,
    kicker: "Porównanie rozwiązań",
    title: "Otrzymujesz dostępne warianty i jasne różnice",
    body: "Zakres, koszty, warunki i ograniczenia przedstawione w prosty sposób.",
    tags: ["17 firm ubezpieczeniowych", "9 banków"],
  },
  {
    n: 4,
    kicker: "Wspólna decyzja",
    title: "Wybierasz rozwiązanie dopasowane do siebie",
    body: "Decyzja należy do Ciebie. Pomagam zrozumieć konsekwencje każdego wariantu.",
    tags: ["bez presji", "czas na decyzję"],
  },
  {
    n: 5,
    kicker: "Opieka po zakupie",
    title: "Kontakt nie kończy się po zawarciu umowy",
    body: "Możesz wrócić z pytaniami również później, przy zmianie sytuacji lub potrzeb.",
    tags: ["jedna osoba do kontaktu", "ciągłość obsługi"],
  },
] as const;
```

Note on step 5's `body`: the legacy string was `"Możesz wrócić z pytaniami również później — przy zmianie sytuacji lub potrzeb."` The em-dash is replaced with a comma per Global Constraints. This is one of the 9 dash sites.

`content/partners.ts`:

```ts
export const insurancePartners = [
  { name: "Prudential", file: "prudential.svg" },
  { name: "Compensa", file: "compensa.png" },
  { name: "Wiener", file: "wiener.svg" },
  { name: "Allianz", file: "allianz.svg" },
  { name: "Generali", file: "generali.svg" },
  { name: "Nationale-Nederlanden", file: "nationale-nederlanden.svg" },
  { name: "SIGNAL IDUNA", file: "signal-iduna.svg" },
  { name: "Warta", file: "warta.svg" },
  { name: "Vienna Life", file: "vienna-life.svg" },
  { name: "ERGO Hestia", file: "ergo-hestia.svg" },
  { name: "PZU", file: "pzu.svg" },
  { name: "Leadenhall", file: "leadenhall.svg" },
  { name: "UNIQA", file: "uniqa.svg" },
] as const;

export const bankPartners = [
  { name: "Alior Bank", file: "alior-bank.svg" },
  { name: "Bank Millennium", file: "bank-millennium.svg" },
  { name: "Bank Pekao", file: "bank-pekao.svg" },
  { name: "BNP Paribas", file: "bnp-paribas.png" },
  { name: "BOŚ Bank", file: "bos-bank.svg" },
  { name: "Erste Bank", file: "erste-bank.svg" },
  { name: "ING", file: "ing.svg" },
  { name: "mBank", file: "mbank.svg" },
  { name: "PKO BP", file: "pko-bp.jpg" },
] as const;

/** The subset shown in the scrolling strip below the hero. */
export const marqueePartners = [
  "allianz.svg",
  "generali.svg",
  "warta.svg",
  "pzu.svg",
  "uniqa.svg",
  "ergo-hestia.svg",
  "ing.svg",
  "mbank.svg",
  "pko-bp.jpg",
] as const;
```

The three raster extensions are deliberate; the earlier cleanup pass corrected these paths after they pointed at non-existent `.svg` files.

`content/benefits.ts`:

```ts
export const benefits = [
  {
    figure: "17",
    label: "firm ubezpieczeniowych",
    body: "Większy zakres dostępnych możliwości.",
  },
  { figure: "9", label: "banków", body: "Finansowanie w jednym procesie doradczym." },
  {
    figure: "1",
    label: "stały doradca",
    body: "Jedna osoba prowadzi Cię przez cały proces.",
  },
  { figure: "0 zł", label: "pierwsza konsultacja", body: "Rozmowa bez zobowiązań." },
] as const;
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- content`
Expected: 6 passed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: extract page content into typed modules with a dash guard"
```

---

### Task 4: Layout shell, skip link, header and footer

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/SkipLink.tsx`, `components/SiteHeader.tsx`, `components/SiteFooter.tsx`
- Test: `tests/unit/site-header.test.tsx`

**Interfaces:**
- Consumes: `navItems` (Task 3), `contact` (Task 3), `site` (Task 3), theme tokens (Task 2).
- Produces: `<SkipLink />`, `<SiteHeader />`, `<SiteFooter />`, all default exports. `SiteHeader` is a client component; the other two are server components.

- [ ] **Step 1: Write the failing header test**

`tests/unit/site-header.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import SiteHeader from "@/components/SiteHeader";

describe("SiteHeader", () => {
  it("renders all five nav labels", () => {
    render(<SiteHeader />);
    for (const label of [
      "Strona główna",
      "Poznaj Hannę",
      "Usługi",
      "Partnerzy",
      "Bezpłatna konsultacja",
    ]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("toggles aria-expanded on the menu button", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);
    const button = screen.getByRole("button", { name: /menu/i });

    expect(button).toHaveAttribute("aria-expanded", "false");
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- site-header`
Expected: FAIL, cannot resolve `@/components/SiteHeader`.

- [ ] **Step 3: Write the three components**

`components/SkipLink.tsx` (retire item 18):

```tsx
export default function SkipLink() {
  return (
    <a
      href="#top"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-surface focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-primary-dark focus:shadow-card"
    >
      Przejdź do treści
    </a>
  );
}
```

`components/SiteHeader.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navItems } from "@/content/nav";
import { site } from "@/content/site";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-80 border-b border-line/85 bg-page/85 backdrop-blur-lg">
      <div className="mx-auto flex min-h-[78px] w-[min(100%-40px,var(--container-site))] items-center justify-between">
        <Link href="/" aria-label="Strona główna" className="inline-flex items-center gap-3">
          <span className="grid size-[42px] place-items-center rounded-full bg-primary font-label font-extrabold text-white">
            HK
          </span>
          <span className="block">
            <strong className="block text-sm">{site.name}</strong>
            <small className="block text-[11px] text-muted">{site.role}</small>
          </span>
        </Link>

        <button
          type="button"
          aria-label="Otwórz menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="p-2 lg:hidden"
        >
          <span className="mb-[5px] block h-0.5 w-6 bg-ink" />
          <span className="mb-[5px] block h-0.5 w-6 bg-ink" />
          <span className="block h-0.5 w-6 bg-ink" />
        </button>

        <nav
          aria-label="Główna nawigacja"
          data-open={open}
          className="absolute inset-x-5 top-[78px] hidden flex-col gap-3.5 rounded-xl border border-line bg-surface p-5 shadow-card data-[open=true]:flex lg:static lg:flex lg:flex-row lg:items-center lg:gap-6 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
        >
          {navItems.map((item) => {
            const isCta = item.href === "/#kontakt";
            const isActive = item.href === pathname;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={
                  isCta
                    ? "rounded-pill bg-primary px-4.5 py-3 text-[13px] font-bold text-white transition-colors hover:bg-primary-strong active:translate-y-px"
                    : `text-[13px] font-bold transition-colors hover:text-primary active:translate-y-px ${isActive ? "text-primary" : ""}`
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
```

`components/SiteFooter.tsx` (includes retire item 26, legal links):

```tsx
import Link from "next/link";
import { contact } from "@/content/contact";
import { site } from "@/content/site";

export default function SiteFooter() {
  return (
    <footer className="bg-[#132f48] pb-6 pt-14 text-white">
      <div className="mx-auto grid w-[min(100%-40px,var(--container-site))] gap-15 md:grid-cols-[1.5fr_.7fr_.7fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="grid size-[42px] place-items-center rounded-full bg-accent font-label font-extrabold text-primary-dark">
              HK
            </span>
            <span className="block">
              <strong className="block text-sm">{site.name}</strong>
              <small className="block text-[11px] text-[#8fa8ba]">{site.role}</small>
            </span>
          </Link>
          <p className="mt-4.5 max-w-[470px] text-xs text-[#8fa8ba]">
            Strona informacyjna. Zakres produktów zależy od posiadanych uprawnień oraz
            aktualnej współpracy z partnerami.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <strong>Serwis</strong>
          <Link className="text-[13px] text-[#bed0dd]" href="/#jak-dzialam">Jak działam</Link>
          <Link className="text-[13px] text-[#bed0dd]" href="/#uslugi">Usługi</Link>
          <Link className="text-[13px] text-[#bed0dd]" href="/#partnerzy">Partnerzy</Link>
          <Link className="text-[13px] text-[#bed0dd]" href="/polityka-prywatnosci">
            Polityka prywatności
          </Link>
        </div>

        <div className="flex flex-col gap-2.5">
          <strong>Kontakt</strong>
          <a className="text-[13px] text-[#bed0dd]" href={contact.phoneHref}>{contact.phone}</a>
          <a className="text-[13px] text-[#bed0dd]" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
        </div>
      </div>

      <div className="mx-auto mt-10 flex w-[min(100%-40px,var(--container-site))] flex-col gap-1.5 border-t border-white/10 pt-5 text-[11px] text-[#7893a6] md:flex-row md:justify-between">
        <span>
          &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> {site.name}
        </span>
      </div>
    </footer>
  );
}
```

The legacy `<span id="year">` filled by JS becomes a render-time value. `suppressHydrationWarning` covers a server/client year mismatch across a New Year boundary.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- site-header`
Expected: 2 passed.

- [ ] **Step 5: Mount the shell in the root layout**

In `app/layout.tsx`, replace the `<body>` children with:

```tsx
      <body
        className={`${dmSans.variable} ${playfair.variable} ${manrope.variable}`}
      >
        <SkipLink />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
```

And add the imports below the font imports:

```tsx
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SkipLink from "@/components/SkipLink";
```

- [ ] **Step 6: Verify the build**

Run: `npm run build`
Expected: build succeeds. `/` remains a static route despite `SiteHeader` being a client component.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add layout shell with skip link, header and footer"
```

---

### Task 5: Reveal primitive

Replaces the legacy `IntersectionObserver` plus `.reveal { opacity: 0 }` pattern. Fixes the brief's section 9 item "content is invisible without JS" and implements reduced motion as "degrade to static" rather than zeroed durations.

**Files:**
- Create: `components/Reveal.tsx`
- Test: `tests/unit/reveal.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `<Reveal delay?: number; className?: string; children: React.ReactNode />`, default export, client component.

- [ ] **Step 1: Write the failing test**

`tests/unit/reveal.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import Reveal from "@/components/Reveal";

beforeAll(() => {
  // jsdom does not implement matchMedia; simulate reduced motion being on
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
});

describe("Reveal", () => {
  it("renders children so content is never hidden behind motion", () => {
    render(
      <Reveal>
        <p>Widoczna treść</p>
      </Reveal>,
    );
    expect(screen.getByText("Widoczna treść")).toBeVisible();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- reveal`
Expected: FAIL, cannot resolve `@/components/Reveal`.

- [ ] **Step 3: Write the component**

`components/Reveal.tsx`:

```tsx
"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

export default function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.12 });

  // CRITICAL: do not pass a hidden state through the `initial` prop. Motion
  // serialises `initial` into inline styles during SSR, so `opacity: 0` would
  // ship in the HTML and the content would stay invisible without JS. That is
  // exactly the trap the legacy `.reveal { opacity: 0 }` rule had.
  // Instead we animate via `animate`, and the hidden state only switches on
  // after hydration. The server always renders the content visible.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const hidden = mounted && !reduce && !inView;

  return (
    <motion.div
      ref={ref}
      className={className}
      animate={{ opacity: hidden ? 0 : 1, y: hidden ? 22 : 0 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

Why this shape rather than the idiomatic `initial` plus `whileInView` pair: Motion renders the `initial` prop into inline styles during SSR. `initial={{ opacity: 0 }}` therefore ships `style="opacity:0"` in the HTML, and with JavaScript disabled the content never becomes visible. Task 14's "content is visible with JavaScript disabled" test exists precisely to catch that, and the idiomatic version fails it.

Above-the-fold elements are in view on the first client render, so `hidden` stays `false` and nothing flashes. Below-the-fold elements briefly flip to hidden on mount, which the user cannot see because they are below the fold. Under reduced motion `hidden` is always `false`, which is the required degrade-to-static behavior.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- reveal`
Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Reveal primitive with static reduced-motion fallback"
```

---

### Task 6: Move logo assets, then build Hero and PartnerMarquee

The marquee becomes a sibling of the hero rather than a child, which is retire item 7.

**Files:**
- Move: `assets/logos/*` to `public/logos/*` (22 files)
- Create: `app/_components/Hero.tsx`, `app/_components/PartnerMarquee.tsx`
- Modify: `app/page.tsx`, `app/globals.css`
- Test: `tests/e2e/logos.spec.ts`

**Interfaces:**
- Consumes: `contact`, `site`, `marqueePartners` (Task 3), `Reveal` (Task 5).
- Produces: `<Hero />` and `<PartnerMarquee />`, default exports, server components.

- [ ] **Step 1: Move the assets with history preserved**

```bash
mkdir -p public/logos
git mv assets/logos/*.svg assets/logos/*.png assets/logos/*.jpg public/logos/
rmdir assets/logos assets
ls public/logos | wc -l
```

Expected output: `22`

- [ ] **Step 2: Add the marquee keyframes to the theme**

Append inside the existing `@theme` block in `app/globals.css`:

```css
  --animate-marquee: marquee 26s linear infinite;
```

And append at the end of the file, outside any layer:

```css
@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}
```

- [ ] **Step 3: Write Hero**

`app/_components/Hero.tsx`:

```tsx
import { contact } from "@/content/contact";
import { site } from "@/content/site";
import Reveal from "@/components/Reveal";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-gradient-to-b from-surface-blue/90 to-page/98 pb-11 pt-25">
      <div className="pointer-events-none absolute right-[2%] top-[2%] size-[390px] rounded-full bg-[#b8dff5] opacity-36 blur-[90px]" />
      <div className="pointer-events-none absolute bottom-[2%] left-[-5%] size-[280px] rounded-full bg-[#f1dfba] opacity-36 blur-[90px]" />

      <div className="relative z-2 mx-auto grid w-[min(100%-40px,var(--container-site))] items-center gap-20 lg:grid-cols-[1.08fr_.92fr]">
        <Reveal>
          <div className="mb-7 w-fit rounded-pill border border-[#ccdeeb] bg-white/72 px-3.5 py-2.5 text-xs font-bold text-primary-dark">
            <span className="mr-2 inline-block size-2 rounded-full bg-success shadow-[0_0_0_6px_rgb(74_147_109/0.12)]" />
            Konsultacje online i stacjonarnie w Zielonej Górze
          </div>

          <h1 className="mb-6.5 max-w-[760px] font-display text-[clamp(44px,5.2vw,66px)] leading-[1.06] tracking-[-0.028em]">
            Finanse i ubezpieczenia dopasowane do Twojej sytuacji.
          </h1>

          <p className="max-w-[65ch] text-[19px] text-muted">
            Pomagam porównać dostępne rozwiązania, wyjaśniam najważniejsze różnice i
            prowadzę przez cały proces, od pierwszej rozmowy do wyboru właściwej oferty.
          </p>

          <div className="my-8.5 flex flex-wrap gap-3.5">
            <a
              href="#kontakt"
              className="inline-flex min-h-[54px] items-center justify-center rounded-pill bg-primary px-6 font-label font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-primary-strong active:translate-y-0"
            >
              Bezpłatna konsultacja
            </a>
            <a
              href="#uslugi"
              className="inline-flex min-h-[54px] items-center justify-center rounded-pill border border-line bg-white/75 px-6 font-label font-extrabold text-ink transition hover:-translate-y-0.5 active:translate-y-0"
            >
              Zobacz zakres usług
            </a>
          </div>

          <p className="max-w-[65ch] text-[11px] text-[#8190a1]">
            Zakres dostępnych produktów zależy od aktualnych uprawnień i współpracy z
            daną instytucją.
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="overflow-hidden rounded-[34px] border border-white/80 bg-surface shadow-card">
            <div className="relative grid min-h-[450px] place-items-center content-center gap-3.5 bg-[radial-gradient(circle_at_50%_25%,rgb(255_255_255/0.85),transparent_27%),linear-gradient(145deg,#d9e9f3,#f3e9d8)] text-primary-dark">
              <span className="grid size-[170px] place-items-center rounded-full border border-primary/12 bg-white/78 font-display text-[52px]">
                HK
              </span>
              {/* TODO: professional advisor photograph, 900x1100.
                  DESIGN-BRIEF.md section 8.3 and retire item 14. */}
              <small className="font-bold opacity-65">
                Miejsce na profesjonalne zdjęcie doradcy
              </small>
              <div className="absolute right-5.5 top-5.5 rounded-pill border border-primary/14 bg-white/88 px-3.5 py-2.5 text-[11px] font-extrabold text-primary-dark shadow-card-soft">
                <span className="mr-2 inline-block size-2 rounded-full bg-success" />
                Bezpłatna konsultacja
              </div>
            </div>

            <div className="grid gap-5 p-6.5 md:grid-cols-[1fr_auto]">
              <div>
                <span className="font-label text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary">
                  Twój doradca
                </span>
                <p className="mb-1.5 mt-1 font-label text-2xl font-bold">{site.name}</p>
                <p className="text-[13px] text-muted">
                  Ubezpieczenia, kredyty i rozwiązania finansowe
                </p>
              </div>
              <div className="flex flex-col justify-center text-xs font-bold md:text-right">
                <a className="text-primary" href={contact.phoneHref}>{contact.phone}</a>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

Two Global Constraint edits applied here: the hero lead's em-dash became a comma, and the CTA label is now `Bezpłatna konsultacja`, matching the nav (retire item 4, one label per intent). The `.hero-facts` block (17 / 9 / 1 osoba) is deliberately **not** ported into the hero; the same figures already live in the benefits strip that Task 7 renders, which resolves retire item 6's trust-strip violation without designing anything new.

- [ ] **Step 4: Write PartnerMarquee**

`app/_components/PartnerMarquee.tsx`:

```tsx
import { marqueePartners } from "@/content/partners";

export default function PartnerMarquee() {
  return (
    <section aria-label="Wybrani partnerzy" className="bg-page pb-11">
      <div className="mx-auto grid w-[min(100%-40px,var(--container-site))] items-center gap-7 md:grid-cols-[auto_1fr]">
        <span className="font-label text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted">
          Wybrani partnerzy
        </span>
        <div className="overflow-hidden">
          <div className="flex w-max animate-marquee gap-10.5 motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:gap-y-5">
            {marqueePartners.map((file) => (
              <img
                key={file}
                src={`/logos/${file}`}
                alt=""
                aria-hidden="true"
                width={160}
                height={60}
                loading="lazy"
                /* mix-blend-mode blends the white background of raster logos (JPEG/PNG) */
                className="block h-6.5 w-auto mix-blend-multiply grayscale opacity-55"
              />
            ))}
            {marqueePartners.map((file) => (
              <img
                key={`dup-${file}`}
                src={`/logos/${file}`}
                alt=""
                aria-hidden="true"
                width={160}
                height={60}
                loading="lazy"
                className="block h-6.5 w-auto mix-blend-multiply grayscale opacity-55 motion-reduce:hidden"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

Every marquee logo is `aria-hidden` because the accessible list of partners is the Task 9 grid; the marquee is decoration. Plain `<img>` is used rather than `next/image` because these are fixed-size decorative marks and the blend-mode plus grayscale filter chain is simpler without the wrapper.

- [ ] **Step 5: Compose the page**

`app/page.tsx`:

```tsx
import Hero from "@/app/_components/Hero";
import PartnerMarquee from "@/app/_components/PartnerMarquee";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <PartnerMarquee />
    </main>
  );
}
```

- [ ] **Step 6: Write the failing asset test**

`tests/e2e/logos.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { bankPartners, insurancePartners, marqueePartners } from "../../content/partners";

test("every logo file resolves with HTTP 200", async ({ request }) => {
  const files = new Set<string>([
    ...marqueePartners,
    ...insurancePartners.map((p) => p.file),
    ...bankPartners.map((p) => p.file),
  ]);

  for (const file of files) {
    const res = await request.get(`/logos/${file}`);
    expect(res.status(), `/logos/${file}`).toBe(200);
  }
});

test("the marquee lives outside the hero section", async ({ page }) => {
  await page.goto("/");
  const heroContainsMarquee = await page.evaluate(() => {
    const hero = document.querySelector("#top");
    const marquee = document.querySelector('[aria-label="Wybrani partnerzy"]');
    return Boolean(hero && marquee && hero.contains(marquee));
  });
  expect(heroContainsMarquee).toBe(false);
});
```

- [ ] **Step 7: Run the tests**

Run: `npm run test:e2e -- logos.spec.ts`
Expected: 2 passed. A 404 means a filename in `content/partners.ts` disagrees with `public/logos/`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: port hero, move logos to public, lift marquee out of the hero"
```

---

### Task 7: Journey section and benefits strip

The progress indicator moves from animated `height` to `transform: scaleY()`, which is retire item 25.

**Files:**
- Create: `app/_components/Journey.tsx`, `app/_components/JourneyTrack.tsx`
- Modify: `app/page.tsx`
- Test: `tests/unit/journey-track.test.tsx`

**Interfaces:**
- Consumes: `journeySteps`, `benefits` (Task 3), `Reveal` (Task 5).
- Produces:
  - `<Journey />`, default export, **Server Component**.
  - `<JourneyTrack>{children}</JourneyTrack>`, default export, **Client Component**. Props: `{ children: React.ReactNode }`. Owns the scroll ref and renders both the static rail and the animated progress bar; the step cards arrive as server-rendered `children`.

- [ ] **Step 1: Write the failing test**

`tests/unit/journey.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import JourneyTrack from "@/app/_components/JourneyTrack";

beforeAll(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
});

describe("JourneyTrack", () => {
  it("renders server-provided children untouched", () => {
    render(
      <JourneyTrack>
        <article>Krok pierwszy</article>
        <article>Krok drugi</article>
      </JourneyTrack>,
    );
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getByText("Krok pierwszy")).toBeVisible();
  });

  it("drives the progress bar with a transform, never with height", () => {
    render(
      <JourneyTrack>
        <article>Krok</article>
      </JourneyTrack>,
    );
    const bar = screen.getByTestId("journey-progress");
    expect(bar.style.height).toBe("");
    expect(bar.className).toContain("origin-top");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- journey-track`
Expected: FAIL, cannot resolve `@/app/_components/JourneyTrack`.

- [ ] **Step 3: Write the client leaf**

This is the only part of the section that needs the browser. The step cards arrive as server-rendered `children`.

`app/_components/JourneyTrack.tsx`:

```tsx
"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";

export default function JourneyTrack({ children }: { children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // useScroll instead of window.addEventListener("scroll") and instead of
  // measuring offsetHeight in JS. Progress is a transform, never a height.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start center", "end center"],
  });
  const scaleY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1]), {
    stiffness: 100,
    damping: 20,
  });

  return (
    <div ref={trackRef} className="relative grid gap-5.5">
      {/* static rail */}
      <div className="absolute bottom-8 left-[30px] top-8 w-[3px] rounded-pill bg-line" />
      {/* animated progress; scaleY, so no layout is recalculated */}
      <motion.div
        data-testid="journey-progress"
        style={{ scaleY: reduce ? 1 : scaleY }}
        className="absolute bottom-8 left-[30px] top-8 w-[3px] origin-top rounded-pill bg-gradient-to-b from-primary to-accent"
      />
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Write the server section**

No `"use client"` here. The five step cards, the sticky column and the benefits strip all stay on the server.

`app/_components/Journey.tsx`:

```tsx
import JourneyTrack from "@/app/_components/JourneyTrack";
import { benefits } from "@/content/benefits";
import { journeySteps } from "@/content/journey";
import Reveal from "@/components/Reveal";

export default function Journey() {
  return (
    <section id="jak-dzialam" className="bg-surface py-26">
      <div className="mx-auto grid w-[min(100%-40px,var(--container-site))] items-start gap-21 lg:grid-cols-[.82fr_1.18fr]">
        <Reveal className="lg:sticky lg:top-28">
          <p className="mb-3 font-label text-xs font-extrabold uppercase tracking-[0.15em] text-primary">
            Jak wygląda współpraca
          </p>
          <h2 className="mb-4.5 font-display text-[clamp(38px,4.6vw,60px)] leading-[1.06] tracking-[-0.028em]">
            Od pierwszego kontaktu do decyzji, bez chaosu i bez presji.
          </h2>
          <p className="max-w-[65ch] text-lg text-muted">
            Każdy etap ma konkretny cel. Najpierw poznaję Twoją sytuację, później
            porządkujemy potrzeby, a dopiero na końcu porównujemy dostępne możliwości.
          </p>

          <figure className="mt-10 rounded-2xl border border-line bg-page p-6.5 shadow-card-soft">
            <blockquote className="text-xl font-bold leading-relaxed">
              Dobra decyzja finansowa zaczyna się od rozmowy, a nie od wyboru pierwszej
              oferty.
            </blockquote>
            <figcaption className="mt-4.5 text-muted">Hanna Khudziakova</figcaption>
          </figure>

          <a
            href="#kontakt"
            className="mt-7 inline-flex min-h-[54px] items-center justify-center rounded-pill bg-primary px-6 font-label font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-primary-strong active:translate-y-0"
          >
            Bezpłatna konsultacja
          </a>
        </Reveal>

        <JourneyTrack>
          {journeySteps.map((step) => (
            <article key={step.n} className="relative pl-[82px]">
              <div className="absolute left-2.5 top-7 z-2 grid size-11 place-items-center rounded-full border-2 border-primary bg-primary font-label font-extrabold text-white">
                {step.n}
              </div>
              <div className="rounded-2xl border border-line bg-surface p-7 shadow-card-soft transition hover:-translate-y-0.5">
                <span className="font-label text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">
                  {step.kicker}
                </span>
                <h3 className="mb-2 mt-1.5 font-display text-2xl">{step.title}</h3>
                <p className="max-w-[65ch] text-muted">{step.body}</p>
                <div className="mt-4.5 flex flex-wrap gap-2">
                  {step.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-pill bg-surface-blue px-3 py-2 text-[11px] font-bold text-[#45627b]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </JourneyTrack>
      </div>

      <div className="mx-auto mt-17 grid w-[min(100%-40px,var(--container-site))] gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b) => (
          <Reveal key={b.label}>
            <div className="h-full rounded-2xl border border-line bg-page p-6">
              <strong className="block font-label text-3xl tabular-nums text-primary">
                {b.figure}
              </strong>
              <span className="mt-1.5 block font-bold">{b.label}</span>
              <p className="mt-2.5 text-[13px] text-muted">{b.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
```

Three constraint items land here: the h2's em-dash became a comma, `tabular-nums` is applied to the figures (retire item 21), and the step-opacity dimming from the legacy CSS is dropped because it hid content behind scroll state.

Note what the split buys: `Journey` imports `JourneyTrack` (a Client Component) and hands it server-rendered `<article>` elements. Only the two absolutely-positioned bars plus the scroll spring cross into the bundle. Marking the whole section `"use client"` instead would have shipped nine cards of static markup for no reason.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- journey-track`
Expected: 2 passed.

- [ ] **Step 6: Add Journey to the page**

In `app/page.tsx`, add the import and render `<Journey />` after `<PartnerMarquee />`:

```tsx
import Hero from "@/app/_components/Hero";
import Journey from "@/app/_components/Journey";
import PartnerMarquee from "@/app/_components/PartnerMarquee";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <PartnerMarquee />
      <Journey />
    </main>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: port journey timeline with a transform-driven progress leaf"
```

---

### Task 8: Services section with Phosphor icons

Retire item 10: the six emoji become icon-library glyphs.

**Files:**
- Create: `app/_components/Services.tsx`
- Modify: `app/page.tsx`
- Test: `tests/unit/services.test.tsx`

**Interfaces:**
- Consumes: `services` and `ServiceIconName` (Task 3), `Reveal` (Task 5).
- Produces: `<Services />`, default export, **Server Component**.

Phosphor's default entry (`@phosphor-icons/react`) is client-only, which would force `"use client"` onto this whole section. Version 2.1.10 ships a server-safe entry at `@phosphor-icons/react/ssr`, confirmed present in the package's export map. Import from there and the section stays on the server.

- [ ] **Step 1: Write the failing test**

`tests/unit/services.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import Services from "@/app/_components/Services";

beforeAll(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
});

describe("Services", () => {
  it("renders all six service titles", () => {
    render(<Services />);
    expect(screen.getAllByRole("article")).toHaveLength(6);
    expect(screen.getByText("Ubezpieczenia na życie")).toBeInTheDocument();
    expect(screen.getByText("Kredyty i finansowanie")).toBeInTheDocument();
  });

  it("uses one shared CTA label across every card", () => {
    render(<Services />);
    expect(screen.getAllByRole("link", { name: "Bezpłatna konsultacja" })).toHaveLength(6);
  });

  it("contains no emoji", () => {
    const { container } = render(<Services />);
    // Zakres Emoji Presentation; legacy uzywalo ciezko-emoji ikon
    expect(container.textContent ?? "").not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- services`
Expected: FAIL, cannot resolve `@/app/_components/Services`.

- [ ] **Step 3: Write the component**

`app/_components/Services.tsx`:

```tsx
import {
  AirplaneTilt,
  Bank,
  Buildings,
  Car,
  Heart,
  House,
  type Icon,
} from "@phosphor-icons/react/ssr";
import { services, type ServiceIconName } from "@/content/services";
import Reveal from "@/components/Reveal";

const icons: Record<ServiceIconName, Icon> = {
  heart: Heart,
  car: Car,
  house: House,
  airplane: AirplaneTilt,
  building: Buildings,
  bank: Bank,
};

export default function Services() {
  return (
    <section id="uslugi" className="bg-surface-soft py-26">
      <div className="mx-auto w-[min(100%-40px,var(--container-site))]">
        <Reveal>
          <div className="mb-13 max-w-[790px]">
            <h2 className="mb-4.5 font-display text-[clamp(38px,4.6vw,60px)] leading-[1.06] tracking-[-0.028em]">
              Wybierz temat, który chcesz uporządkować.
            </h2>
            <p className="max-w-[65ch] text-muted">
              Proste produkty mogą zostać obsłużone online. Przy bardziej złożonych
              decyzjach najlepszym początkiem jest konsultacja.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5.5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const IconComponent = icons[service.icon];
            return (
              <Reveal key={service.id}>
                <article className="flex h-full min-h-[300px] flex-col rounded-2xl border border-line bg-surface p-7.5 shadow-card-soft transition hover:-translate-y-1 active:translate-y-0">
                  <div className="grid size-12 place-items-center rounded-lg bg-surface-blue">
                    <IconComponent size={24} weight="duotone" className="text-primary" />
                  </div>
                  <h3 className="mb-2.5 mt-6 font-display text-[22px]">{service.title}</h3>
                  <p className="max-w-[65ch] text-muted">{service.body}</p>
                  <a
                    href="#kontakt"
                    className="mt-auto pt-6 font-label font-extrabold text-primary transition hover:text-primary-strong"
                  >
                    Bezpłatna konsultacja
                  </a>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

The six distinct legacy CTA labels collapse to one, per retire item 4. `mt-auto` preserves the bottom-aligned CTA from the regression guard. `weight="duotone"` is set once here; the design phase may change it, but it must stay uniform across all six per the icon stroke-consistency rule.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- services`
Expected: 3 passed.

- [ ] **Step 5: Add Services to the page**

Add the import and render `<Services />` after `<Journey />` in `app/page.tsx`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: port services section with Phosphor icons and one CTA label"
```

---

### Task 9: Partners section

**Files:**
- Create: `app/_components/Partners.tsx`
- Modify: `app/page.tsx`
- Test: `tests/unit/partners.test.tsx`

**Interfaces:**
- Consumes: `insurancePartners`, `bankPartners` (Task 3), `Reveal` (Task 5).
- Produces: `<Partners />`, default export, server component.

- [ ] **Step 1: Write the failing test**

`tests/unit/partners.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Partners from "@/app/_components/Partners";

describe("Partners", () => {
  it("renders 22 named logos with alt text", () => {
    render(<Partners />);
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(22);
    for (const img of images) {
      expect(img).toHaveAttribute("alt", expect.stringMatching(/\S/));
    }
  });

  it("labels the two groups", () => {
    render(<Partners />);
    expect(screen.getByRole("heading", { name: "Ubezpieczenia" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Banki" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- partners`
Expected: FAIL, cannot resolve `@/app/_components/Partners`.

- [ ] **Step 3: Write the component**

`app/_components/Partners.tsx`:

```tsx
import { bankPartners, insurancePartners } from "@/content/partners";
import Reveal from "@/components/Reveal";

type Group = {
  heading: string;
  note: string;
  items: ReadonlyArray<{ name: string; file: string }>;
};

const groups: Group[] = [
  {
    heading: "Ubezpieczenia",
    note: "13 marek reprezentujących 17 podmiotów",
    items: insurancePartners,
  },
  { heading: "Banki", note: "9 instytucji we współpracy", items: bankPartners },
];

export default function Partners() {
  return (
    <section id="partnerzy" className="bg-surface py-26">
      <div className="mx-auto w-[min(100%-40px,var(--container-site))]">
        <Reveal>
          <div className="mb-10 max-w-[790px]">
            <h2 className="mb-4.5 font-display text-[clamp(38px,4.6vw,60px)] leading-[1.06] tracking-[-0.028em]">
              17 firm ubezpieczeniowych oraz 9 banków.
            </h2>
            <p className="max-w-[65ch] text-muted">
              Na stronie głównej pokazuję marki w czytelnej formie. Pełne nazwy prawne oraz
              zakres produktów mogę przedstawić na osobnej podstronie.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5.5">
          {groups.map((group) => (
            <Reveal key={group.heading}>
              <div className="rounded-4xl border border-line bg-page p-7.5">
                <div className="mb-5.5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <h3 className="font-display text-2xl">{group.heading}</h3>
                  <span className="text-xs tabular-nums text-muted">{group.note}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {group.items.map((p) => (
                    <img
                      key={p.file}
                      src={`/logos/${p.file}`}
                      alt={p.name}
                      width={160}
                      height={60}
                      loading="lazy"
                      className="max-h-[72px] min-h-[72px] w-full rounded-lg border border-[#dce6ed] bg-surface object-contain p-3.5 grayscale opacity-70 transition hover:-translate-y-0.5 hover:grayscale-0 hover:opacity-100"
                    />
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- partners`
Expected: 2 passed.

- [ ] **Step 5: Add Partners to the page**

Add the import and render `<Partners />` after `<Services />` in `app/page.tsx`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: port partners section with both logo grids"
```

---

### Task 10: Consultation section and the Lendi slot

Retire item 1 forbids porting the div-based fake form. It becomes a labeled placeholder slot instead, which is honest and keeps the section renderable until the real embed code arrives.

**Files:**
- Create: `app/_components/Consultation.tsx`
- Modify: `app/page.tsx`
- Test: `tests/unit/consultation.test.tsx`

**Interfaces:**
- Consumes: `contact` (Task 3), `Reveal` (Task 5).
- Produces: `<Consultation />`, default export, server component.

- [ ] **Step 1: Write the failing test**

`tests/unit/consultation.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Consultation from "@/app/_components/Consultation";

describe("Consultation", () => {
  it("renders no fake form controls", () => {
    render(<Consultation />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("exposes the widget slot for the real embed", () => {
    render(<Consultation />);
    expect(screen.getByTestId("lendi-slot")).toBeInTheDocument();
  });

  it("offers the contact details as real links", () => {
    render(<Consultation />);
    expect(screen.getByRole("link", { name: /\+48/ })).toHaveAttribute(
      "href",
      "tel:+48000000000",
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- consultation`
Expected: FAIL, cannot resolve `@/app/_components/Consultation`.

- [ ] **Step 3: Write the component**

`app/_components/Consultation.tsx`:

```tsx
import { contact } from "@/content/contact";
import Reveal from "@/components/Reveal";

export default function Consultation() {
  return (
    <section id="kontakt" className="bg-surface-soft py-26">
      <Reveal className="mx-auto w-[min(100%-40px,var(--container-site))]">
        <div className="grid overflow-hidden rounded-[34px] bg-surface shadow-card lg:grid-cols-[.82fr_1.18fr]">
          <div className="bg-[radial-gradient(circle_at_20%_20%,rgb(210_170_104/0.15),transparent_28%),var(--color-primary-dark)] p-12 text-white">
            <h2 className="mb-4.5 font-display text-[clamp(38px,4.6vw,60px)] leading-[1.06] tracking-[-0.028em]">
              Zacznij od krótkiej rozmowy.
            </h2>
            <p className="max-w-[65ch] text-[#bfd0de]">
              Wypełnij formularz konsultacyjny Lendi. Skontaktuję się z Tobą, aby poznać
              temat i ustalić dalszy sposób działania.
            </p>

            <ul className="mt-4 list-disc pl-4.5 text-[#d2dee8]">
              <li>bez zobowiązań,</li>
              <li>bez przesyłania dokumentów na pierwszym etapie,</li>
              <li>możliwość rozmowy online lub stacjonarnie.</li>
            </ul>

            <div className="mt-8 grid gap-3">
              <a className="border-b border-white/10 py-3.5" href={contact.phoneHref}>
                <small className="block text-[#89a2b7]">Telefon</small>
                <strong className="block tabular-nums">{contact.phone}</strong>
              </a>
              <a className="border-b border-white/10 py-3.5" href={`mailto:${contact.email}`}>
                <small className="block text-[#89a2b7]">E-mail</small>
                <strong className="block">{contact.email}</strong>
              </a>
            </div>
          </div>

          <div className="bg-surface p-9.5">
            {/*
              TODO: embed the official Lendi widget.
              DESIGN-BRIEF.md retire item 1: do not rebuild a fake form out of divs.
              The widget must arrive with its own loading / error / validation states
              (retire item 19) and cookie consent (retire item 27).
            */}
            <div
              data-testid="lendi-slot"
              className="grid min-h-[420px] place-items-center rounded-2xl border-2 border-dashed border-line p-8 text-center"
            >
              <div>
                <p className="font-label font-extrabold text-primary-dark">
                  Miejsce na formularz Lendi
                </p>
                <p className="mx-auto mt-2 max-w-[46ch] text-[13px] text-muted">
                  Po otrzymaniu oficjalnego kodu widget zostanie osadzony w tym miejscu.
                  Do tego czasu prosimy o kontakt telefoniczny lub e-mail.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
```

The dark panel is ported as-is. It violates the brief's theme lock (retire item 8), which is explicitly deferred; do not "fix" it here, because the design phase decides between committing to a full theme and toning the panel down.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- consultation`
Expected: 3 passed.

- [ ] **Step 5: Add Consultation to the page**

Add the import and render `<Consultation />` after `<Partners />` in `app/page.tsx`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: port consultation section with an honest Lendi slot"
```

---

### Task 11: The `/poznaj-hanne` page

**Requires the URL-change confirmation from Global Constraints before starting.**

**Files:**
- Create: `app/poznaj-hanne/page.tsx`, `app/poznaj-hanne/_components/AboutHero.tsx`, `app/poznaj-hanne/_components/AboutWorking.tsx`
- Test: `tests/e2e/poznaj-hanne.spec.ts`

**Interfaces:**
- Consumes: `contact`, `site` (Task 3), `Reveal` (Task 5).
- Produces: route `/poznaj-hanne`; `<AboutHero />` and `<AboutWorking />`, default exports, server components.

- [ ] **Step 1: Write the failing route test**

`tests/e2e/poznaj-hanne.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("the advisor page renders its heading and philosophy", async ({ page }) => {
  await page.goto("/poznaj-hanne");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "dobra decyzja finansowa",
  );
  await expect(page.getByText("Moja filozofia pracy")).toBeVisible();
});

test("the advisor page has no dead links", async ({ page }) => {
  await page.goto("/poznaj-hanne");
  const deadLinks = await page.locator('a[href="#"]').count();
  expect(deadLinks).toBe(0);
});

test("the four how-I-work blocks render", async ({ page }) => {
  await page.goto("/poznaj-hanne");
  await expect(page.getByRole("article")).toHaveCount(4);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test:e2e -- poznaj-hanne.spec.ts`
Expected: FAIL, 404 on `/poznaj-hanne`.

- [ ] **Step 3: Write AboutHero**

`app/poznaj-hanne/_components/AboutHero.tsx`:

```tsx
import { contact } from "@/content/contact";
import Reveal from "@/components/Reveal";

export default function AboutHero() {
  return (
    <section className="bg-gradient-to-b from-surface-blue to-page pb-19 pt-17">
      <div className="mx-auto grid w-[min(100%-40px,var(--container-site))] items-center gap-14 lg:grid-cols-[440px_1fr]">
        <Reveal>
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#dcecf7] to-[#efe3d1] shadow-card-soft">
            <div className="grid min-h-[500px] place-items-center content-center gap-3.5 text-primary-dark">
              <span className="grid size-[150px] place-items-center rounded-full bg-white/82 font-display text-[46px] font-bold text-primary">
                HK
              </span>
              {/* TODO: candid photograph of Hanna, 880x1000. DESIGN-BRIEF.md section 8.3. */}
              <small className="font-bold text-muted">
                Miejsce na naturalne zdjęcie Hanny
              </small>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <h1 className="mb-5 mt-2.5 max-w-[720px] font-display text-[clamp(40px,4.6vw,58px)] leading-[1.06] tracking-[-0.028em]">
            Wierzę, że dobra decyzja finansowa zaczyna się od zrozumienia Twojej sytuacji.
          </h1>
          <p className="max-w-[65ch] text-lg text-muted">
            Każda współpraca rozpoczyna się od rozmowy. Najpierw poznaję Twoje potrzeby,
            później analizuję dostępne możliwości, a dopiero na końcu wspólnie wybieramy
            rozwiązanie.
          </p>

          <div className="mt-6 rounded-r-xl border-l-4 border-accent bg-surface p-6 shadow-card-soft">
            <strong>Moja filozofia pracy</strong>
            <p className="mt-2 max-w-[65ch] text-muted">
              Nie wierzę w sprzedaż jednej oferty każdemu klientowi. Wolę poświęcić więcej
              czasu na zrozumienie sytuacji niż proponować rozwiązanie, które nie będzie
              odpowiadało Twoim potrzebom.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a
              href={contact.phoneHref}
              className="rounded-lg border border-line bg-white/82 px-4 py-3.5"
            >
              <small className="block font-label text-[10px] font-extrabold uppercase tracking-[0.09em] text-[#8797a8]">
                Telefon
              </small>
              <strong className="mt-1.5 block text-[13px] tabular-nums">{contact.phone}</strong>
            </a>
            <a
              href={`mailto:${contact.email}`}
              className="rounded-lg border border-line bg-white/82 px-4 py-3.5"
            >
              <small className="block font-label text-[10px] font-extrabold uppercase tracking-[0.09em] text-[#8797a8]">
                E-mail
              </small>
              <strong className="mt-1.5 block text-[13px]">{contact.email}</strong>
            </a>
            <div className="rounded-lg border border-line bg-white/82 px-4 py-3.5">
              <small className="block font-label text-[10px] font-extrabold uppercase tracking-[0.09em] text-[#8797a8]">
                Spotkania
              </small>
              <strong className="mt-1.5 block text-[13px]">
                {contact.location} i online
              </strong>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

The legacy Facebook tile pointed at `href="#"`. It is dropped rather than ported, per the dead-link rule; re-add it in the design phase once a real profile URL exists.

- [ ] **Step 4: Write AboutWorking**

`app/poznaj-hanne/_components/AboutWorking.tsx`:

```tsx
import Reveal from "@/components/Reveal";

const blocks = [
  {
    n: "01",
    title: "Najpierw rozmawiamy",
    body: "Pierwszym krokiem nie jest wybór produktu. Chcę zrozumieć Twoją sytuację, odpowiedzieć na pytania i uporządkować potrzeby. Dopiero wtedy porównujemy dostępne rozwiązania.",
    featured: true,
  },
  {
    n: "02",
    title: "Porównuję możliwości",
    body: "Różnice, warunki i ograniczenia wyjaśniam prostym językiem.",
    featured: false,
  },
  {
    n: "03",
    title: "Bez presji",
    body: "Decyzję podejmujesz świadomie i we własnym tempie.",
    featured: false,
  },
  {
    n: "04",
    title: "Jestem również później",
    body: "Możesz wrócić z pytaniami także po podpisaniu umowy.",
    featured: false,
  },
] as const;

export default function AboutWorking() {
  const [featured, ...rest] = blocks;

  return (
    <section className="bg-surface py-26">
      <div className="mx-auto w-[min(100%-40px,var(--container-site))]">
        <Reveal>
          <div className="mb-13 max-w-[790px]">
            <p className="mb-3 font-label text-xs font-extrabold uppercase tracking-[0.15em] text-primary">
              Jak pracuję
            </p>
            <h2 className="mb-4.5 font-display text-[clamp(38px,4.6vw,60px)] leading-[1.06] tracking-[-0.028em]">
              Czego możesz oczekiwać podczas współpracy?
            </h2>
            <p className="max-w-[65ch] text-muted">
              Minimum formalności na początku, jasne wyjaśnienie możliwości i czas na
              świadomą decyzję.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5.5 lg:grid-cols-[1.12fr_.88fr]">
          <Reveal>
            <article className="flex h-full min-h-[420px] flex-col justify-end rounded-2xl border border-line bg-[radial-gradient(circle_at_80%_10%,rgb(47_120_183/0.12),transparent_28%),var(--color-page)] p-9">
              <span className="font-label text-[11px] font-extrabold tracking-[0.12em] text-primary">
                {featured.n}
              </span>
              <h3 className="mb-3 mt-4.5 max-w-[500px] font-display text-3xl">
                {featured.title}
              </h3>
              <p className="max-w-[65ch] text-muted">{featured.body}</p>
            </article>
          </Reveal>

          <div className="grid gap-4">
            {rest.map((b) => (
              <Reveal key={b.n}>
                <article className="h-full rounded-2xl border border-line bg-page px-6.5 py-6">
                  <span className="font-label text-[11px] font-extrabold tracking-[0.12em] text-primary">
                    {b.n}
                  </span>
                  <h3 className="mb-1.5 mt-2.5 font-display text-xl">{b.title}</h3>
                  <p className="max-w-[65ch] text-[13px] text-muted">{b.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Write the page**

`app/poznaj-hanne/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import AboutHero from "@/app/poznaj-hanne/_components/AboutHero";
import AboutWorking from "@/app/poznaj-hanne/_components/AboutWorking";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Poznaj Hannę",
  description:
    "Poznaj Hannę Khudziakovą: sposób pracy, bezpośredni kontakt i podejście do konsultacji ubezpieczeniowych oraz finansowych.",
  alternates: { canonical: "/poznaj-hanne" },
};

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <AboutWorking />

      <section className="bg-surface pb-26 pt-4">
        <Reveal className="mx-auto w-[min(100%-40px,var(--container-site))]">
          <div className="rounded-4xl border border-line bg-surface-blue px-12 py-10">
            <blockquote className="max-w-[930px] font-display text-[clamp(27px,3vw,42px)] font-bold leading-snug">
              Moim celem nie jest sprzedaż produktu. Chcę pomóc Ci podjąć decyzję, z którą
              będziesz czuć się bezpiecznie również później.
            </blockquote>
            <p className="mt-3 max-w-[65ch] text-muted">
              Masz pytania dotyczące ubezpieczenia, kredytu albo finansowania? Pierwsza
              rozmowa pozwoli uporządkować temat i określić dalszy krok.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="bg-surface-soft py-26">
        <Reveal className="mx-auto w-[min(100%-40px,var(--container-site))]">
          <div className="grid items-center gap-10 rounded-4xl bg-primary-dark px-12 py-10 text-white lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="mb-2.5 font-display text-[clamp(34px,4vw,50px)] leading-[1.06] tracking-[-0.028em]">
                Porozmawiajmy o Twojej sytuacji.
              </h2>
              <p className="max-w-[65ch] text-[#bed0dd]">
                Pierwsza rozmowa jest bez zobowiązań i nie wymaga przesyłania dokumentów.
              </p>
            </div>
            <Link
              href="/#kontakt"
              className="inline-flex min-h-[54px] w-fit items-center justify-center whitespace-nowrap rounded-pill bg-primary px-6 font-label font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-primary-strong active:translate-y-0"
            >
              Bezpłatna konsultacja
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm run test:e2e -- poznaj-hanne.spec.ts`
Expected: 3 passed.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: port the poznaj-hanne page"
```

---

### Task 12: Custom 404 and the privacy-policy placeholder

Retire items 26 and 28.

**Files:**
- Create: `app/not-found.tsx`, `app/polityka-prywatnosci/page.tsx`
- Test: `tests/e2e/routes.spec.ts`

**Interfaces:**
- Consumes: `navItems` (Task 3).
- Produces: routes `/polityka-prywatnosci` and the 404 boundary.

- [ ] **Step 1: Write the failing test**

`tests/e2e/routes.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("unknown routes return a branded 404 with a way back", async ({ page }) => {
  const response = await page.goto("/nie-ma-takiej-strony");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("404");
  await expect(page.getByRole("link", { name: "Strona główna" }).first()).toBeVisible();
});

test("the privacy policy route exists and is marked as a draft", async ({ page }) => {
  await page.goto("/polityka-prywatnosci");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Polityka prywatności",
  );
  await expect(page.getByTestId("legal-draft-notice")).toBeVisible();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test:e2e -- routes.spec.ts`
Expected: FAIL on both.

- [ ] **Step 3: Write the 404 page**

`app/not-found.tsx`:

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid w-[min(100%-40px,var(--container-site))] min-h-[60vh] place-items-center py-26">
      <div className="max-w-[560px] text-center">
        <p className="font-label text-xs font-extrabold uppercase tracking-[0.15em] text-primary">
          404
        </p>
        <h1 className="mb-4.5 mt-3 font-display text-[clamp(38px,4.6vw,56px)] leading-[1.06] tracking-[-0.028em]">
          404. Nie znaleźliśmy tej strony.
        </h1>
        <p className="mx-auto max-w-[52ch] text-muted">
          Adres mógł się zmienić albo zawierać literówkę. Poniżej znajdziesz najważniejsze
          sekcje serwisu.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3.5">
          <Link
            href="/"
            className="inline-flex min-h-[54px] items-center justify-center rounded-pill bg-primary px-6 font-label font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-primary-strong active:translate-y-0"
          >
            Strona główna
          </Link>
          <Link
            href="/#kontakt"
            className="inline-flex min-h-[54px] items-center justify-center rounded-pill border border-line bg-surface px-6 font-label font-extrabold text-ink transition hover:-translate-y-0.5 active:translate-y-0"
          >
            Bezpłatna konsultacja
          </Link>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Write the privacy-policy placeholder**

`app/polityka-prywatnosci/page.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  robots: { index: false, follow: false },
  alternates: { canonical: "/polityka-prywatnosci" },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-[min(100%-40px,var(--container-site))] py-26">
      <h1 className="mb-6 max-w-[720px] font-display text-[clamp(38px,4.6vw,56px)] leading-[1.06] tracking-[-0.028em]">
        Polityka prywatności
      </h1>

      {/*
        This page is a shell. The legal text must be written or approved by a
        human; DESIGN-BRIEF.md sections 8.3 and 11.F treat legal copy as never
        silently changed. Do not generate legal content.
      */}
      <div
        data-testid="legal-draft-notice"
        className="max-w-[65ch] rounded-2xl border-2 border-dashed border-line bg-surface p-8"
      >
        <p className="font-label font-extrabold text-primary-dark">
          Dokument w przygotowaniu
        </p>
        <p className="mt-2 text-muted">
          Treść polityki prywatności oraz informacja RODO zostaną opublikowane przed
          uruchomieniem formularza konsultacyjnego. W sprawach dotyczących danych
          osobowych prosimy o kontakt bezpośredni.
        </p>
      </div>
    </main>
  );
}
```

`robots: { index: false }` keeps an empty legal page out of the index until it has real content.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm run test:e2e -- routes.spec.ts`
Expected: 2 passed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add custom 404 and privacy-policy placeholder route"
```

---

### Task 13: Metadata, favicon, sitemap and robots

Closes the brief's section 7 SEO gaps.

**Files:**
- Modify: `app/layout.tsx`, `app/page.tsx`
- Create: `app/icon.svg`, `app/sitemap.ts`, `app/robots.ts`
- Test: `tests/e2e/metadata.spec.ts`

**Interfaces:**
- Consumes: `site` (Task 3).
- Produces: `metadataBase`, per-page `title` and `description`, canonical URLs, Open Graph tags, favicon, `/sitemap.xml`, `/robots.txt`.

- [ ] **Step 1: Write the failing test**

`tests/e2e/metadata.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("the home page carries title, description, canonical and OG tags", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Hanna Khudziakova/);

  const description = page.locator('meta[name="description"]');
  await expect(description).toHaveAttribute("content", /ubezpiecze/i);

  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    "content",
    "website",
  );
});

test("a favicon is served", async ({ request }) => {
  const res = await request.get("/icon.svg");
  expect(res.status()).toBe(200);
});

test("sitemap and robots are generated", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("/poznaj-hanne");

  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Sitemap:");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test:e2e -- metadata.spec.ts`
Expected: FAIL on canonical, OG, `/icon.svg`, `/sitemap.xml`.

- [ ] **Step 3: Expand the root metadata**

Replace the `metadata` export in `app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL(site.baseUrl),
  title: {
    default: `${site.name} - ${site.role}`,
    template: `%s - ${site.name}`,
  },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: site.name,
    title: `${site.name} - ${site.role}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};
```

Add the import: `import { site } from "@/content/site";`

Add a page-level override in `app/page.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};
```

- [ ] **Step 4: Write the favicon**

`app/icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="HK">
  <circle cx="32" cy="32" r="32" fill="#2f78b7"/>
  <text x="32" y="42" text-anchor="middle" font-family="Georgia, serif" font-size="28" font-weight="700" fill="#ffffff">HK</text>
</svg>
```

This is a monogram wordmark, which is the one case the brief's iconography rule permits as hand-authored SVG. It is not a decorative illustration.

- [ ] **Step 5: Write sitemap and robots**

`app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.baseUrl}/`, priority: 1 },
    { url: `${site.baseUrl}/poznaj-hanne`, priority: 0.8 },
  ];
}
```

`app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/polityka-prywatnosci" }],
    sitemap: `${site.baseUrl}/sitemap.xml`,
  };
}
```

**Blocked item to record:** `site.baseUrl` is `https://example.invalid`. Canonical URLs, OG URLs and the sitemap are all wrong until the real domain is known. Add this to `DESIGN-BRIEF.md` section 8.3 as a blocker in Step 7 below.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm run test:e2e -- metadata.spec.ts`
Expected: 3 passed.

- [ ] **Step 7: Record the domain blocker in the brief**

Append to the list in `DESIGN-BRIEF.md` section 8.3:

```markdown
- Production domain. `content/site.ts` ships `https://example.invalid`; canonical URLs,
  Open Graph URLs and `sitemap.xml` are all wrong until it is replaced.
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add metadata, favicon, sitemap and robots"
```

---

### Task 14: Regression-guard suite

Encodes the brief's 14-row regression guard plus its mechanical counts as executable assertions, so the deferred design phase cannot silently undo them.

**Files:**
- Create: `tests/e2e/regression-guard.spec.ts`
- Test: itself

**Interfaces:**
- Consumes: every route from Tasks 6 to 13.
- Produces: nothing importable; a gate.

- [ ] **Step 1: Write the suite**

`tests/e2e/regression-guard.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/poznaj-hanne"] as const;

for (const route of ROUTES) {
  test(`${route}: zero em-dashes and en-dashes in visible text`, async ({ page }) => {
    await page.goto(route);
    const text = await page.locator("body").innerText();
    const offenders = text
      .split("\n")
      .filter((line) => line.includes("—") || line.includes("–"));
    expect(offenders).toEqual([]);
  });

  test(`${route}: semantic landmarks present`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("header")).toHaveCount(1);
    await expect(page.locator("nav")).not.toHaveCount(0);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("footer")).toHaveCount(1);
  });

  test(`${route}: no inline style attributes authored in markup`, async ({ page }) => {
    await page.goto(route);
    // Motion writes inline styles at runtime, so only check elements outside
    // its tree: count the attribute on links and images.
    const count = await page.locator("a[style], img[style]").count();
    expect(count).toBe(0);
  });

  test(`${route}: no dead links`, async ({ page }) => {
    await page.goto(route);
    expect(await page.locator('a[href="#"], a[href=""]').count()).toBe(0);
  });

  test(`${route}: every image has non-empty alt or is aria-hidden`, async ({ page }) => {
    await page.goto(route);
    const bad = await page.evaluate(() =>
      [...document.images].filter(
        (img) =>
          img.getAttribute("aria-hidden") !== "true" &&
          !(img.getAttribute("alt") ?? "").trim(),
      ).length,
    );
    expect(bad).toBe(0);
  });

  test(`${route}: no image fails to load`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    const broken = await page.evaluate(() =>
      [...document.images]
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.currentSrc || img.src),
    );
    expect(broken).toEqual([]);
  });

  test(`${route}: z-index stays on a sane scale`, async ({ page }) => {
    await page.goto(route);
    const max = await page.evaluate(() =>
      Math.max(
        0,
        ...[...document.querySelectorAll("*")]
          .map((el) => Number.parseInt(getComputedStyle(el).zIndex, 10))
          .filter((n) => Number.isFinite(n)),
      ),
    );
    expect(max).toBeLessThanOrEqual(100);
  });

  test(`${route}: no pure black and no 100vh`, async ({ page }) => {
    await page.goto(route);
    const found = await page.evaluate(() => {
      const offenders: string[] = [];
      for (const el of document.querySelectorAll("*")) {
        const s = getComputedStyle(el);
        if (s.backgroundColor === "rgb(0, 0, 0)") offenders.push("pure-black-bg");
        if (s.height === `${window.innerHeight}px` && s.minHeight === "100vh") {
          offenders.push("100vh");
        }
      }
      return offenders;
    });
    expect(found).toEqual([]);
  });

  test(`${route}: keyboard focus is visible on the first link`, async ({ page }) => {
    await page.goto(route);
    await page.keyboard.press("Tab");
    const outline = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      const s = getComputedStyle(el);
      return { width: s.outlineWidth, style: s.outlineStyle };
    });
    expect(outline?.style).not.toBe("none");
    expect(outline?.width).not.toBe("0px");
  });
}

test("skip link is the first tab stop and targets main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const text = await page.evaluate(() => document.activeElement?.textContent?.trim());
  expect(text).toBe("Przejdź do treści");
});

test("public anchor targets all exist on the home page", async ({ page }) => {
  await page.goto("/");
  for (const id of ["top", "jak-dzialam", "uslugi", "partnerzy", "kontakt"]) {
    await expect(page.locator(`#${id}`), `#${id}`).toHaveCount(1);
  }
});

test("nav labels are unchanged", async ({ page }) => {
  await page.goto("/");
  const nav = page.locator("header nav");
  for (const label of [
    "Strona główna",
    "Poznaj Hannę",
    "Usługi",
    "Partnerzy",
    "Bezpłatna konsultacja",
  ]) {
    await expect(nav.getByRole("link", { name: label })).toHaveCount(1);
  }
});

test("current page is marked in the nav", async ({ page }) => {
  await page.goto("/poznaj-hanne");
  await expect(page.locator('header nav a[aria-current="page"]')).toHaveCount(1);
});

test("at most one marquee on the page", async ({ page }) => {
  await page.goto("/");
  const marquees = await page.evaluate(
    () =>
      [...document.querySelectorAll("*")].filter((el) =>
        getComputedStyle(el).animationName.includes("marquee"),
      ).length,
  );
  expect(marquees).toBeLessThanOrEqual(1);
});

test("no animation targets a non-GPU property", async ({ page }) => {
  await page.goto("/");
  const offenders = await page.evaluate(() => {
    const banned = ["height", "width", "top", "left", "margin", "padding"];
    const out: string[] = [];
    for (const el of document.querySelectorAll("*")) {
      const props = getComputedStyle(el).transitionProperty.split(",").map((p) => p.trim());
      for (const p of props) {
        if (banned.includes(p)) out.push(`${el.tagName}:${p}`);
      }
    }
    return out;
  });
  expect(offenders).toEqual([]);
});

test("reduced motion keeps content visible and stops the marquee", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const opacity = await page
    .getByRole("heading", { level: 1 })
    .evaluate((el) => getComputedStyle(el).opacity);
  expect(Number(opacity)).toBeGreaterThan(0.9);

  await context.close();
});

test("content is visible with JavaScript disabled", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Wybierz temat")).toBeVisible();
  await expect(page.locator("#partnerzy")).toBeVisible();

  await context.close();
});
```

The last test is the one that would have caught the legacy `.reveal { opacity: 0 }` trap. It is the single most valuable assertion in the file.

- [ ] **Step 2: Run the suite**

Run: `npm run test:e2e -- regression-guard.spec.ts`
Expected: all pass. Two likely genuine failures and their meanings:
- `no animation targets a non-GPU property` failing means a `transition-property` regressed to `all` or to a layout property somewhere.
- `content is visible with JavaScript disabled` failing means a Motion `initial` state is hiding server-rendered content; the fix is in `components/Reveal.tsx`, not in the test.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test: encode the design brief regression guard as e2e assertions"
```

---

### Task 15: Visual parity check, then retire the legacy files

The migration's acceptance criterion. Only after parity is confirmed do the old files go.

**Files:**
- Delete: `index.html`, `poznaj-hanne.html`, `styles.css`, `script.js`
- Modify: `README.md`, `DESIGN-BRIEF.md`

**Interfaces:**
- Consumes: everything.
- Produces: a repo whose only site implementation is the Next app.

- [ ] **Step 1: Capture the legacy baseline**

The legacy site is still in the working tree at this point. Serve it on a second port and screenshot both pages:

```bash
python3 -m http.server 8099 &
sleep 2
npx playwright screenshot --full-page --viewport-size=1440,900 \
  http://127.0.0.1:8099/index.html /tmp/legacy-home.png
npx playwright screenshot --full-page --viewport-size=1440,900 \
  http://127.0.0.1:8099/poznaj-hanne.html /tmp/legacy-about.png
npx playwright screenshot --full-page --viewport-size=390,844 \
  http://127.0.0.1:8099/index.html /tmp/legacy-home-mobile.png
kill %1
```

- [ ] **Step 2: Capture the migrated pages**

```bash
npm run build && npm run start &
sleep 5
npx playwright screenshot --full-page --viewport-size=1440,900 \
  http://127.0.0.1:3000/ /tmp/next-home.png
npx playwright screenshot --full-page --viewport-size=1440,900 \
  http://127.0.0.1:3000/poznaj-hanne /tmp/next-about.png
npx playwright screenshot --full-page --viewport-size=390,844 \
  http://127.0.0.1:3000/ /tmp/next-home-mobile.png
kill %1
```

- [ ] **Step 3: Compare and record deviations**

Open the three pairs side by side. Expected, intended deviations, all traceable to a retire item:
- hero has no 17 / 9 / 1 stat strip (retire item 6)
- marquee sits below the hero's background band rather than inside it (item 7)
- service icons are Phosphor glyphs, not emoji (item 10)
- all service-card CTAs read `Bezpłatna konsultacja` (item 4)
- the consultation panel shows a dashed Lendi slot, not a fake form (item 1)
- the Facebook tile is gone from `/poznaj-hanne` (dead link)
- journey steps are all at full opacity rather than dimmed until scrolled

Any deviation **not** on that list is a porting bug. Fix it before continuing.

- [ ] **Step 4: Run the full suite**

```bash
npm test
npm run test:e2e
npm run build
```

Expected: all unit tests pass, all e2e tests pass, build succeeds with `/`, `/poznaj-hanne`, `/polityka-prywatnosci` listed as static and `/sitemap.xml`, `/robots.txt` as generated routes.

- [ ] **Step 5: Delete the legacy implementation**

```bash
git rm index.html poznaj-hanne.html styles.css script.js
```

- [ ] **Step 6: Rewrite the README**

Replace `README.md` with:

```markdown
# hanna-insurances

Marketing site for an insurance and finance advisor (Hanna Khudziakova, Zielona Góra).
Next.js 15 (App Router) + Tailwind v4. Page copy is in Polish; code and docs are in English.

## Getting started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - development server
- `npm run build` - production build
- `npm test` - unit tests (Vitest)
- `npm run test:e2e` - end-to-end tests and the regression guard (Playwright)

## Architecture

Server Components by default. `"use client"` appears only on the smallest leaf that
needs browser APIs, with server-rendered markup passed in as `children`. Shared
components live in `components/`; route-specific ones sit in `app/<route>/_components/`.
All page copy lives in `content/`, never inline in markup.

## Documentation

- `DESIGN-BRIEF.md` - design direction, inherited constraints, retire list
- `docs/superpowers/plans/` - implementation plans

## Status

Migration off the vanilla implementation is complete. Design work is deliberately
deferred until after the migration; see `DESIGN-BRIEF.md` sections 4 and 8.
```

- [ ] **Step 7: Mark the completed retire items in the brief**

In `DESIGN-BRIEF.md` section 4, tick the boxes for items 2, 4, 7, 10, 11, 16, 17, 18, 20, 21, 22, 25, 26, 28 and both items in section 9. Replace section 10's third bullet ("The stack-independent omissions sweep") with a line stating the sweep ran and the results are in Batch 2.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor: retire the vanilla implementation after verifying parity"
```

---

### Task 16: moved out of this plan

Cookie consent (retire item 27) was added here on 2026-08-25 and moved out on 2026-08-28,
by user decision. It is not migration work: nothing in the legacy site did this, so there is
nothing to port. It is tracked as a separate feature, and its full scope and both blockers
are recorded in `DESIGN-BRIEF.md` section 8.3.

**This plan is complete at 15 tasks.**

---

## Self-Review

**1. Spec coverage.** Every `DESIGN-BRIEF.md` section maps to a task:

| Brief section | Covered by |
|---|---|
| 1 Locked decisions (design read, dials, mode) | Recorded as constraints; dials govern the deferred design phase, not this plan |
| 2 Preserve (anchors, nav labels, copy voice, a11y wins) | Task 3 tests, Task 14 |
| 2 Requires approval (URL change) | Global Constraints, gate on Task 11 |
| 3 Token inventory | Task 2 |
| 4 Retire items, in-scope subset | Tasks 4, 6, 7, 8, 10, 12, 13 as listed in the scoping section |
| 4 Regression guard, 14 rows | Task 14 |
| 5 Keep (journey, split hero, copy voice) | Tasks 6, 7 port them faithfully |
| 6 Known filler (17/9/1 three times) | Partly: Task 6 drops the hero copy of it, reducing three placements to two. Full consolidation is a design-phase call, deliberately not forced here. |
| 7 SEO baseline | Task 13 |
| 8.1 Single accent | Not addressed by design. Both colors ship as tokens in Task 2 so the later choice is a token edit. |
| 8.2 Display typeface | Not addressed by design. Task 2 Step 4 performs the diacritic verification the brief flagged as missing. |
| 8.3 Blocked assets and copy | Tasks 6, 10, 11 leave labeled TODO slots; Task 13 Step 7 adds the domain blocker. |
| 9 Carried-over items | Task 5 (JS-invisible content), Task 5 plus Task 14 (reduced motion done as degrade-to-static) |
| 10 Out of scope | Honored; the animation-plan work stays deferred |

**Gap accepted deliberately:** brief section 6's filler consolidation is only partly done, and retire items 3, 5, 6 (partly), 8, 9, 12, 13, 14, 15, 19, 23, 24 are untouched. All are aesthetic or blocked, per the scoping section. Item 1 is blocked on the real Lendi embed code.

**2. Placeholder scan.** Four real defects found and fixed inline:

- **`Services` was marked `"use client"` for no good reason.** The `"use client"` existed only to satisfy Phosphor's client-only default entry, which would have dragged six cards of static markup into the bundle. Fixed by importing from `@phosphor-icons/react/ssr`, verified present in the 2.1.10 export map.
- **`Journey` was marked `"use client"` for the entire section.** Five step cards, four benefit cards and a sticky column would all have become client code so that one gradient bar could animate. This violated the very rule the plan cites from `design-taste-frontend` section 3.A. Split into a server `Journey` plus a `JourneyTrack` client leaf that receives the cards as `children`.

- Task 1 Step 3's `vitest.config.ts` carried a stray `sr` typo before `globals: true`. Corrected in the block.
- **Task 5's `Reveal` was wrong in a way that would have failed Task 14.** The idiomatic Motion pairing of `initial={{ opacity: 0 }}` with `whileInView` serializes the hidden state into inline styles during SSR, so the no-JavaScript path would ship `style="opacity:0"` and reproduce exactly the legacy `.reveal { opacity: 0 }` trap that brief section 9 records as open. Rewritten to drive the animation through `animate` with a post-hydration `mounted` flag, so the server always renders content visible. This is also why the two assertions live in different tasks: Task 5's unit test alone would not have caught it, because jsdom does not exercise SSR output.

The `TODO:` comments in Tasks 6, 10, 11 and 12 are intentional in-code markers for blocked assets, each naming the brief section that owns it, not plan placeholders.

**3. Type consistency.** Checked across tasks: `ServiceIconName` is defined in Task 3 and consumed in Task 8's `icons` record. `marqueePartners` is `readonly string[]` in Task 3 and spread into a `Set<string>` in Task 6. `insurancePartners` and `bankPartners` share `{ name, file }`, matching Task 9's local `Group` type. `contact.phoneHref` is the single source used in Tasks 4, 10 and 11. `Reveal`'s props (`children`, `delay`, `className`) match every call site. `site.baseUrl` is defined in Task 3 and consumed in Task 13's `metadataBase`, `sitemap` and `robots`. The token name `ink` is used consistently instead of `text` in Tasks 2, 4, 6, 7, 8, 9, 12.

---

## Execution Handoff

Plan complete. Two execution options:

**1. Subagent-Driven (recommended)** - a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** - execute tasks in this session with checkpoints for review.

Two gates must clear before Task 1 starts:
- **Next.js versus Vite + React** (see the assumption note at the top).
- **The `/poznaj-hanne` URL change** (Global Constraints), needed before Task 11.
