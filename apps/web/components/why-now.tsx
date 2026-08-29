'use client'

import { MotionReveal } from './motion-reveal'
import { ScrollWords } from './scroll-words'

export function WhyNow() {
  return (
    <section
      id="why-now"
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
                  Real benchmarks exist for African-language accuracy — 
                  but none of them measure whether a language failure changed the actual decision it produced: 
                  a claim, a loan, a transaction. Fluency gets tested. Consequence doesn't.
                </p>
                <p className="text-body text-pretty text-muted-foreground">
                  At the same time, enterprises shipping AI products into African markets
                  need proof that language-driven decisions — a claim, a loan, a transaction — 
                  are actually correct, not just fluent-sounding.
                </p>
                <div className="border-l-2 border-accent pl-5">
                  <ScrollWords
                    className="font-display text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl"
                    text="Ore: raw material. Reset: what African AI needs before its decisions can be trusted."
                  />
                </div>
              </div>
            </MotionReveal>
          </div>
        </div>
      </div>
    </section>
  )
}