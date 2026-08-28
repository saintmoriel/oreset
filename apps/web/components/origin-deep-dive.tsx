'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { MotionReveal, MotionStagger, MotionStaggerItem } from './motion-reveal'
import { SiteImage } from './site-image'

const ORIGIN_IMAGE =
  'https://images.unsplash.com/photo-1602788526767-f09470bb8e0b?auto=format&fit=crop&w=1400&q=80'

const pillars = [
  {
    title: 'On-device consent and capture',
    detail:
      'Collectors accept tasks from the pool, record speech or capture imagery on-device, and digitally sign consent before anything is submitted. No post-hoc paperwork.',
  },
  {
    title: 'Automated quality gatekeeping',
    detail:
      'Every submission passes through a 4-tier error taxonomy and automated validation checks at capture time. Contributions that fail are rejected before they reach review or payout.',
  },
  {
    title: 'Payout Line and licensed delivery',
    detail:
      'Cleared contributions move to Payout Line with explicit per-task rates and a wage floor. Delivered packages arrive with consent licensing and an inspectable provenance path.',
  },
] as const

export function OriginDeepDive() {
  return (
    <section
      id="origin"
      data-scroll-section
      className="border-t border-border/60 py-16 sm:py-24 md:py-32 lg:py-36"
    >
      <div className="container-wide">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14 xl:gap-16">
          <div className="lg:col-span-5">
            <MotionReveal>
              <p className="text-eyebrow text-accent">Oreset Origin</p>
              <h2 className="text-h1 mt-4 text-balance text-foreground">
                From capture to delivery.
              </h2>
              <p className="text-body-lg mt-5 text-pretty text-muted-foreground">
                Fresh African speech, language, and agricultural imagery—originated in the
                field, verified before delivery, and licensed from the point of capture.
              </p>
              <Link
                href="/capture"
                className="group mt-8 inline-flex min-h-11 items-center gap-2 text-body-sm font-semibold text-accent transition-colors hover:text-copper-600"
              >
                Start contributing
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </MotionReveal>

            <MotionStagger className="mt-10 space-y-0 sm:mt-12" stagger={0.08}>
              {pillars.map((pillar) => (
                <MotionStaggerItem key={pillar.title}>
                  <div className="border-t border-border/70 py-5 first:border-t-0 first:pt-0 last:pb-0">
                    <div
                      data-scroll-line
                      className="mb-4 h-0.5 w-10 origin-left bg-accent"
                      aria-hidden="true"
                    />
                    <p className="font-display text-base font-semibold tracking-tight text-foreground sm:text-lg">
                      {pillar.title}
                    </p>
                    <p className="text-body-sm mt-2 text-pretty text-muted-foreground">
                      {pillar.detail}
                    </p>
                  </div>
                </MotionStaggerItem>
              ))}
            </MotionStagger>
          </div>

          <MotionReveal delay={0.1} className="lg:col-span-7 lg:pt-2">
            <figure className="card-surface overflow-hidden">
              <div className="photo-brand photo-brand-soft relative aspect-[4/3] overflow-hidden sm:aspect-[16/11] lg:aspect-[5/4]">
                <SiteImage
                  data-scroll-media
                  src={ORIGIN_IMAGE}
                  alt="African collectors in a maize field using a smartphone to capture crop imagery"
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="will-change-transform"
                  priority={false}
                />
              </div>
              <figcaption className="flex items-center gap-2 border-t border-border/60 px-4 py-3.5 text-caption text-muted-foreground sm:px-5">
                <span className="motif-dot" aria-hidden="true" />
                Field capture on African farms
              </figcaption>
            </figure>
          </MotionReveal>
        </div>
      </div>
    </section>
  )
}
