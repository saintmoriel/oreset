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
                AI agents are shipping faster than anyone can test them.
              </h2>
            </MotionReveal>
          </div>

          <div className="lg:col-span-7">
            <MotionReveal delay={0.08}>
              <div className="space-y-8">
                <p className="text-body-lg text-pretty text-muted-foreground">
                  Every week, another company launches an AI agent that handles customer
                  support, processes claims, approves loans, or triages patients.
                  Every one of them is shipping scared, because one wrong decision
                  is a headline, a lawsuit, or a lost customer.
                </p>
                <p className="text-body text-pretty text-muted-foreground">
                  The EU AI Act hits in December 2027. Enterprises will need third-party
                  testing to prove their AI agents are safe. The companies that start
                  testing now build the track record. The ones that wait scramble later.
                </p>
                <div className="border-l-2 border-accent pl-5">
                  <ScrollWords
                    className="font-display text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl"
                    text="The penetration test for AI decisions. We break your AI agent before your users do."
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
