'use client'

import { ScrollHighlight } from './scroll-highlight'
import { MotionReveal } from './motion-reveal'

export function ScrollNarrative() {
  return (
    <section className="relative py-32 md:py-44 lg:py-52">
      <div className="mx-auto max-w-5xl px-6">
        <MotionReveal>
          <p className="mb-8 text-xs font-semibold uppercase tracking-eyebrow text-accent">
            Our Mission
          </p>
        </MotionReveal>

        <ScrollHighlight
          text="AI built for Africa operationalizes two core foundations: a 10-stage consented data origination lifecycle and a 6-stage certified talent pipeline. Oreset bridges field-level African origination with enterprise AI systems."
        />
      </div>
    </section>
  )
}
