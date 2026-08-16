'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MotionReveal } from './motion-reveal'
import { SiteImage } from './site-image'

export const OPERATOR_STAGES = [
  { name: 'Sourcing', detail: 'Source native-language professionals with dialect and domain baselines.' },
  { name: 'Training', detail: 'Train on fluency baselines, error taxonomy, and live evaluation sprints.' },
  { name: 'Certification', detail: 'Timed evaluation with calibration thresholds before badge issuance.' },
  { name: 'Bench', detail: 'Certified operators wait on an availability bench by language and domain.' },
  { name: 'Placement', detail: 'Pair operators to enterprise accounts by shift, language, and specialty.' },
  { name: 'Account Management', detail: 'Ongoing telemetry, escalation queues, and dedicated account oversight.' },
] as const

export function OperatorsDeepDive() {
  const [active, setActive] = useState(0)
  const reduceMotion = useReducedMotion()

  return (
    <section id="operators" className="border-t border-border/60 bg-secondary/35 py-16 sm:py-24 md:py-32 lg:py-36">
      <div className="container-wide">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="order-2 lg:order-1 lg:col-span-7">
            <MotionReveal>
              <p className="text-caption font-semibold uppercase tracking-wider text-muted-foreground">
                Lifecycle · scrolls with you
              </p>

              <div className="relative mt-3 mb-5 h-1 overflow-hidden rounded-full bg-border/80">
                <div
                  data-scroll-progress
                  className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-accent"
                />
              </div>

              <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {OPERATOR_STAGES.map((stage, idx) => (
                  <li key={stage.name}>
                    <button
                      type="button"
                      onClick={() => setActive(idx)}
                      onMouseEnter={() => setActive(idx)}
                      className={cn(
                        'flex w-full flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left transition-all duration-200',
                        active === idx
                          ? 'border-accent bg-copper-50 shadow-sm'
                          : 'border-border/70 bg-card hover:border-border',
                      )}
                    >
                      <span className="font-mono text-[10px] font-semibold tabular text-accent">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-caption font-semibold text-foreground">{stage.name}</span>
                    </button>
                  </li>
                ))}
              </ol>

              <motion.div
                key={OPERATOR_STAGES[active].name}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="card-surface mt-4 p-5 md:p-6"
              >
                <p className="text-eyebrow text-accent">
                  Stage {String(active + 1).padStart(2, '0')}
                </p>
                <h3 className="text-h3 mt-2 text-foreground">{OPERATOR_STAGES[active].name}</h3>
                <p className="text-body mt-2 text-muted-foreground">
                  {OPERATOR_STAGES[active].detail}
                </p>
              </motion.div>
            </MotionReveal>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-5">
            <MotionReveal>
              <p className="text-eyebrow text-accent">Oreset Operators</p>
              <h2 className="text-h1 mt-4 text-balance text-foreground">
                A 6-stage certified talent track.
              </h2>
              <p className="text-body-lg mt-5 text-pretty text-muted-foreground">
                For enterprise ops and product leads whose live AI products need ongoing
                native-language review, with a recurring staffing budget, not a one-off gig.
              </p>
            </MotionReveal>

            <MotionReveal delay={0.1}>
              <figure className="card-surface mt-10 overflow-hidden">
                <div className="photo-brand photo-brand-soft relative aspect-[4/3] overflow-hidden">
                  <SiteImage
                    data-scroll-media
                    src="https://images.unsplash.com/photo-1612299273045-362a39972259?auto=format&fit=crop&w=1200&q=80"
                    alt="Black professional working on a laptop, illustrative of operator review work"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="will-change-transform"
                  />
                </div>
                <figcaption className="flex items-center gap-2 border-t border-border/60 px-4 py-3 text-caption text-muted-foreground">
                  <span className="motif-dot" aria-hidden="true" />
                  Native-language review at the workstation
                </figcaption>
              </figure>
            </MotionReveal>

            <MotionReveal delay={0.14}>
              <a
                href="#contact"
                className="mt-6 inline-flex text-body-sm font-semibold text-accent hover:text-copper-600"
              >
                Hire certified operators →
              </a>
            </MotionReveal>
          </div>
        </div>
      </div>
    </section>
  )
}