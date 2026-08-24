import { Reveal } from '@/components/Reveal';

const blocks = [
  {
    n: '01',
    title: 'Najpierw rozmawiamy',
    body: 'Pierwszym krokiem nie jest wybór produktu. Chcę zrozumieć Twoją sytuację, odpowiedzieć na pytania i uporządkować potrzeby. Dopiero wtedy porównujemy dostępne rozwiązania.',
  },
  {
    n: '02',
    title: 'Porównuję możliwości',
    body: 'Różnice, warunki i ograniczenia wyjaśniam prostym językiem.',
  },
  {
    n: '03',
    title: 'Bez presji',
    body: 'Decyzję podejmujesz świadomie i we własnym tempie.',
  },
  {
    n: '04',
    title: 'Jestem również później',
    body: 'Możesz wrócić z pytaniami także po podpisaniu umowy.',
  },
] as const;

export const AboutWorking = () => {
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
              Minimum formalności na początku, jasne wyjaśnienie możliwości i
              czas na świadomą decyzję.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5.5 lg:grid-cols-[1.12fr_.88fr]">
          <Reveal>
            {/*
              styles.css line 1080 sets the radial wash and --page in one
              `background` shorthand. Split here on purpose: Tailwind cannot type
              a bg-[...] whose layers mix a gradient and a bare colour, and emits
              no rule at all for it, which ships an unstyled panel that every
              unit test still passes. Same defect the plan carried in Task 10.
            */}
            <article className="flex h-full min-h-85 flex-col justify-end rounded-2xl border border-line bg-page bg-[image:radial-gradient(circle_at_80%_10%,rgb(47_120_183/0.12),transparent_28%)] p-6.5 sm:min-h-105 sm:p-9">
              <span className="font-label text-[11px] font-extrabold tracking-[0.12em] text-primary">
                {featured.n}
              </span>
              <h3 className="mt-4.5 mb-3 max-w-[500px] font-display text-[32px]">
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
                  <h3 className="mt-2.5 mb-1.5 font-display text-xl">
                    {b.title}
                  </h3>
                  <p className="max-w-[65ch] text-[13px] text-muted">
                    {b.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
