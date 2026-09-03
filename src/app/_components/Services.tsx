// The default entry of @phosphor-icons/react is client-only; /ssr keeps this
// section on the server. The types live only on the main entry, so `Icon` comes
// from there as a type-only import, which is erased before bundling.
import type { Icon } from '@phosphor-icons/react';
import {
  AirplaneTilt,
  Bank,
  Buildings,
  Car,
  Heart,
  House,
} from '@phosphor-icons/react/ssr';
import { Reveal } from '@/components/Reveal';
import { services, type ServiceIconName } from '@/content/services';

const icons: Record<ServiceIconName, Icon> = {
  heart: Heart,
  car: Car,
  house: House,
  airplane: AirplaneTilt,
  building: Buildings,
  bank: Bank,
};

export const Services = () => {
  return (
    <section id="services" className="bg-surface-soft py-26">
      <div className="mx-auto w-[min(100%-40px,var(--container-site))]">
        <Reveal>
          <div className="mb-13 max-w-[790px]">
            <p className="mb-3 font-label text-xs font-extrabold uppercase tracking-[0.15em] text-primary">
              Zakres usług
            </p>
            <h2 className="mb-4.5 font-display text-[clamp(38px,4.6vw,60px)] leading-[1.06] tracking-[-0.028em] font-bold">
              Wybierz temat, który chcesz uporządkować.
            </h2>
            <p className="max-w-[65ch] text-muted">
              Proste produkty mogą zostać obsłużone online. Przy bardziej
              złożonych decyzjach najlepszym początkiem jest konsultacja.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5.5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const IconComponent = icons[service.icon];
            return (
              <Reveal key={service.id}>
                <article className="flex h-full min-h-75 flex-col rounded-2xl border border-line bg-surface p-7.5 shadow-card-soft transition hover:-translate-y-1 active:translate-y-0">
                  <div className="grid size-12 place-items-center rounded-lg bg-surface-blue">
                    <IconComponent
                      size={24}
                      weight="duotone"
                      aria-hidden="true"
                      className="text-primary"
                    />
                  </div>
                  <h3 className="mb-2.5 mt-6 text-[22px] font-bold">
                    {service.title}
                  </h3>
                  <p className="max-w-[65ch] text-muted">{service.body}</p>
                  {/*
                    One visible label across all six cards, retire item 4. The
                    accessible name adds the service so the links list does not
                    read as six identical entries; it starts with the visible
                    text, so WCAG 2.5.3 Label in Name still holds. mt-auto keeps
                    the CTA bottom-aligned, which is in the regression guard.
                  */}
                  <a
                    href="#contact"
                    aria-label={`Bezpłatna konsultacja: ${service.title}`}
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
};
