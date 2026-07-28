import { marqueePartners } from '@/content/partners';

export const PartnerMarquee = () => {
  return (
    <section aria-label="Wybrani partnerzy" className="pb-11 overflow-clip">
      <div className="mx-auto grid w-[min(100%-40px,var(--container-site))] items-center gap-7 md:grid-cols-[auto_1fr]">
        <span className="font-label text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted">
          Wybrani partnerzy
        </span>
        <div className="overflow-hidden">
          <div className="flex w-max animate-marquee motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:gap-y-5">
            {/*
              The list is rendered twice so translateX(-50%) loops seamlessly.
              The second copy exists only for the loop, so it is hidden when the
              animation is off. One map over a doubled array, not two maps.

              Spacing is mr-10.5 on every item, deliberately NOT gap on the
              track: 18 items have 17 gaps, so the track measures 2S + 17g while
              one period is S + 9g. Half the track then falls half a gap short of
              the period and the loop jumps back 21px every cycle. A trailing
              margin on each item makes the pitch uniform, so -50% is exact.
            */}
            {[...marqueePartners, ...marqueePartners].map((file, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${file}-${i}`}
                src={`/logos/${file}`}
                alt=""
                aria-hidden="true"
                width={160}
                height={60}
                loading="lazy"
                /* mix-blend-mode blends the white background of raster logos (JPEG/PNG) */
                className={`block h-6.5 w-auto mr-10.5 mix-blend-multiply grayscale opacity-55${
                  i >= marqueePartners.length ? ' motion-reduce:hidden' : ''
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
