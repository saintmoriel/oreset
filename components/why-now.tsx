'use client'

import { MotionReveal } from './motion-reveal'
import { ScrollWords } from './scroll-words'

export function WhyNow() {
  return (
    <section
      id="about"
      data-scroll-section
      className="border-t border-border/60 bg-secondary/40 py-16 sm:py-24 md:py-32 lg:py-36"
    >
      <div className="container-wide">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <MotionReveal>
              <p className="text-eyebrow text-accent">Why now</p>
              <h2 className="text-h1 mt-4 text-balance text-foreground">
                Why Africa. Why this model.
              </h2>
            </MotionReveal>
          </div>

          <div className="lg:col-span-7">
            <MotionReveal delay={0.08}>
              <div className="space-y-8">
                <p className="text-body-lg text-pretty text-muted-foreground">
                  Low-resource African languages sit at the edge of today’s training regimes:
                  thin scrapes, weak evaluation benches, and little infrastructure for consented
                  field origination. That gap is not a content problem; it is an origination and
                  verification problem.
                </p>
                <p className="text-body text-pretty text-muted-foreground">
                  At the same time, enterprises shipping AI products into African markets need
                  ongoing native-language QA they can trust, not anonymous gig queues. Oreset
                  treats both sides as one network: raw field data refined through a provenance
                  pipeline, and raw fluency refined through Foundry certification, under a Shared
                  Trust Ledger that makes reliability visible before stakes rise.
                </p>
                <div className="border-l-2 border-accent pl-5">
                  <ScrollWords
                    className="font-display text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl"
                    text="Ore: raw material. Reset: how African AI gets its data and its people."
                  />
                </div>
                <p className="text-body-sm text-muted-foreground">
                  Oreset Africa Hub is CAC-registered in Abuja, Nigeria, building partner
                  conversations before scale. Selected for Stage 2 of the iDICE Founders Lab.
                  The work ahead is rigor first: pipelines you can inspect, not metrics you have
                  to take on faith.
                </p>
              </div>
            </MotionReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
