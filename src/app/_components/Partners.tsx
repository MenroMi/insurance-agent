import Image from 'next/image';
import { Reveal } from '@/components/Reveal';
import { bankPartners, insurancePartners } from '@/content/partners';

type Group = {
  heading: string;
  note: string;
  items: ReadonlyArray<{ name: string; file: string }>;
};

const groups: Group[] = [
  {
    heading: 'Ubezpieczenia',
    note: '13 marek reprezentujących 17 podmiotów',
    items: insurancePartners,
  },
  { heading: 'Banki', note: '9 instytucji we współpracy', items: bankPartners },
];

export const Partners = () => {
  return (
    <section id="partners" className="bg-surface py-26">
      <div className="mx-auto w-[min(100%-40px,var(--container-site))]">
        <Reveal>
          {/*
            Two columns with the intro paragraph beside the heading, not stacked
            under it: styles.css line 530 sets
            `grid-template-columns: 1fr .8fr; gap: 70px; align-items: end`.
            The plan ported this as the same stacked .section-heading block the
            other sections use, which reads as a porting slip rather than a
            decision, so the Task 15 parity check restores the legacy layout.
            Collapses at lg, matching the legacy 1020px breakpoint to within 4px.
          */}
          <div className="mb-10 grid items-end gap-17.5 lg:grid-cols-[1fr_.8fr]">
            <div>
              <p className="mb-3 font-label text-xs font-extrabold uppercase tracking-[0.15em] text-primary">
                Zakres współpracy
              </p>
              <h2 className="font-display text-[clamp(38px,4.6vw,60px)] leading-[1.06] font-bold tracking-[-0.028em]">
                17 firm ubezpieczeniowych oraz 9 banków.
              </h2>
            </div>
            <p className="max-w-[65ch] text-muted">
              Na stronie głównej pokazuję marki w czytelnej formie. Pełne nazwy
              prawne oraz zakres produktów mogę przedstawić na osobnej
              podstronie.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5.5">
          {groups.map((group) => (
            <Reveal key={group.heading}>
              <div className="rounded-4xl border border-line bg-page p-7.5">
                <div className="mb-5.5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-2xl font-bold">{group.heading}</h3>
                  <span className="text-xs tabular-nums text-muted">
                    {group.note}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {group.items.map((p) => (
                    // next/image for the four raster marks, which display at
                    // 72px tall but weigh ~148 kB unprocessed. It passes the 18
                    // SVGs through untouched: Next never optimizes SVG without
                    // dangerouslyAllowSVG, so `unoptimized` is applied for them
                    // automatically.
                    <Image
                      key={p.file}
                      src={`/logos/${p.file}`}
                      alt={p.name}
                      width={160}
                      height={60}
                      loading="lazy"
                      className="h-18 w-full rounded-lg border border-logo-line bg-surface object-contain p-3.5 opacity-70 grayscale transition hover:-translate-y-0.5 hover:opacity-100 hover:grayscale-0"
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
};
