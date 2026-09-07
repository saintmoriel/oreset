'use client'

import { GraduationCap, GitCompare, Tags } from 'lucide-react'
import { MotionReveal, MotionStagger, MotionStaggerItem } from '@/components/motion-reveal'

const PILLARS = [
  {
    icon: GraduationCap,
    title: 'Calibrated testers',
    detail:
      "Every tester passes scored practice scenarios with known correct outcomes before running a live engagement. Accuracy is tracked continuously.",
  },
  {
    icon: GitCompare,
    title: 'Dual-review consensus',
    detail:
      'Critical findings are independently verified by a second tester. Agreement is measured automatically. Disagreements go to a senior analyst, not a coin flip.',
  },
  {
    icon: Tags,
    title: 'Structured severity taxonomy',
    detail:
      'Every failure is tagged with a specific error type, severity level, and business impact. You get structured data, not a vague summary.',
  },
]

export function QualityMethodology() {
  return (
    <section id="methodology" className="border-t border-border/60 py-16 sm:py-24 md:py-32">
      <div className="container-wide">
        <MotionReveal>
          <p className="text-eyebrow text-accent">Testing methodology</p>
          <h2 className="text-h1 mt-4 max-w-2xl text-balance text-foreground">
            Rigorous by design, not by claim.
          </h2>
          <p className="text-body-lg mt-5 max-w-2xl text-pretty text-muted-foreground">
            Every engagement follows a structured process built for
            auditability. This is how we ensure the assessment itself is trustworthy.
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
