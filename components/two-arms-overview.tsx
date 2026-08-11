'use client'

import { ArrowRight } from 'lucide-react'
import { MotionReveal, MotionStagger, MotionStaggerItem } from './motion-reveal'
import { SiteImage } from './site-image'

const arms = [
  {
    id: 'origin-card',
    href: '#origin',
    label: 'Oreset Origin',
    arm: 'Data arm',
    stages: 'Field-to-delivery pipeline',
    summary:
      'Local collectors originate fresh African speech, language, and agri imagery, with consent and licensing built in from capture.',
    image:
      'https://images.unsplash.com/photo-1602788526767-f09470bb8e0b?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'African collectors in a maize field capturing crop imagery on a smartphone',
  },
  {
    id: 'operators-card',
    href: '#operators',
    label: 'Oreset Operators',
    arm: 'Talent arm',
    stages: '6-stage track',
    summary:
      'Native-language professionals trained and certified for AI-assisted review, correction, and ongoing product QA.',
    image:
      'https://images.unsplash.com/photo-1612299273045-362a39972259?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Black professional working on a laptop for operator review work',
  },
]

export function TwoArmsOverview() {
  return (
    <section
      id="arms"
      data-scroll-section
      className="border-t border-border/60 bg-secondary/40 py-16 sm:py-24 md:py-32"
    >
      <div className="container-wide">
        <MotionReveal>
          <div className="max-w-2xl">
            <p className="text-eyebrow text-accent">Two arms · one ledger</p>
            <h2 className="text-h1 mt-4 text-balance text-foreground">
              How Oreset is structured.
            </h2>
            <p className="text-body-lg mt-5 text-pretty text-muted-foreground">
              Origin and Operators share one origination engine and one trust philosophy.
              Reliability is earned before higher-stakes work is unlocked.
            </p>
          </div>
        </MotionReveal>

        <MotionStagger className="mt-10 grid gap-5 sm:mt-12 sm:gap-6 lg:grid-cols-2 lg:gap-8" stagger={0.12}>
          {arms.map((arm) => (
            <MotionStaggerItem key={arm.id}>
              <article className="card-surface-raised group flex h-full flex-col overflow-hidden">
                <div className="photo-brand photo-brand-soft relative aspect-[16/10] overflow-hidden">
                  <SiteImage
                    data-scroll-media
                    src={arm.image}
                    alt={arm.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="will-change-transform transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6 md:p-8">
                  <p className="text-eyebrow text-accent">{arm.arm}</p>
                  <h3 className="text-h2 mt-2 text-foreground">{arm.label}</h3>
                  <p className="text-body mt-3 text-muted-foreground">{arm.summary}</p>
                  <p className="mt-4 inline-flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-muted-foreground">
                    <span className="motif-dot" aria-hidden="true" />
                    {arm.stages}
                  </p>
                  <a
                    href={arm.href}
                    className="mt-auto inline-flex min-h-11 items-center gap-2 pt-6 text-body-sm font-semibold text-accent transition-colors hover:text-copper-600"
                  >
                    Learn more
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </div>
              </article>
            </MotionStaggerItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  )
}
