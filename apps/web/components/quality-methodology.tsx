'use client'

import { GraduationCap, GitCompare, Tags } from 'lucide-react'
import { MotionReveal, MotionStagger, MotionStaggerItem } from '@/components/motion-reveal'

const PILLARS = [
  {
    icon: GraduationCap,
    title: 'Calibration before production',
    detail:
      "Every reviewer passes scored practice cases with known correct answers before touching live data. Pass rates and scores are tracked continuously, not just at onboarding.",
  },
  {
    icon: GitCompare,
    title: 'Dual-solve consensus',
    detail:
      'High-stakes cases are independently reviewed by two certified reviewers. Agreement is measured automatically. Disagreements go to a senior adjudicator, not a coin flip.',
  },
  {
    icon: Tags,
    title: 'Structured error taxonomy',
    detail:
      'Every correction is tagged with a specific error type and severity level. Clients get structured data on what went wrong and how badly, not just a pass/fail.',
  },
]

export function QualityMethodology() {
  return (
    <section className="border-t border-border/60 py-16 sm:py-24 md:py-32">
      <div className="container-wide">
        <MotionReveal>
          <p className="text-eyebrow text-accent">Verification methodology</p>
          <h2 className="text-h1 mt-4 max-w-2xl text-balance text-foreground">
            Rigorous by design, not by claim.
          </h2>
          <p className="text-body-lg mt-5 max-w-2xl text-pretty text-muted-foreground">
            Every verification case passes through a structured process built for
            auditability. This is how we ensure the review itself is trustworthy.
          </p>
        </MotionReveal>

        <MotionStagger className="mt-12 grid gap-8 sm:grid-cols-3" staggerDelay={0.1}>
          {PILLARS.map((p) => (
            <MotionStaggerItem key={p.title}>
              <div className="border-t border-border pt-6">
                <div
                  data-scroll-line
                  className="mb-5 h-0.5 w-10 origin-left bg-accent"
                  aria-hidden="true"
                />
                <p.icon className="size-5 text-accent" />
                <p className="text-h4 mt-3 text-foreground">{p.title}</p>
                <p className="text-body-sm mt-2 text-muted-foreground">{p.detail}</p>
              </div>
            </MotionStaggerItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  )
}
