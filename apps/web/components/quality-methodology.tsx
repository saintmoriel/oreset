'use client'

import { GraduationCap, GitCompare, ShieldCheck, Tags } from 'lucide-react'
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
      'High-stakes scenarios are assessed independently by two testers. Agreement is measured statistically, not assumed. Disagreements go to adjudication, not a coin flip.',
  },
  {
    icon: ShieldCheck,
    title: 'Lead auditor verification',
    detail:
      'Every critical or high finding is reproduced by a lead auditor before you see it. They confirm it, correct the severity, or throw it out. False positives never reach your dashboard.',
  },
  {
    icon: Tags,
    title: 'Structured taxonomy',
    detail:
      'Every finding carries an OWASP-aligned vulnerability class, a P0 to P3 severity, reproduction steps, and a business impact. Structured data you can act on and export, not a summary.',
  },
]

export function QualityMethodology() {
  return (
    <section id="methodology" className="border-t border-border/60 py-16 sm:py-24 md:py-32">
      <div className="container-wide">
        <MotionReveal>
          <p className="text-eyebrow text-accent">Testing methodology</p>
          <h2 className="text-h1 mt-4 max-w-2xl text-balance text-foreground">
            Every finding is checked twice before you see it.
          </h2>
          <p className="text-body-lg mt-5 max-w-2xl text-pretty text-muted-foreground">
            A red team is only as good as its false positive rate. Ours is built to be
            measured: calibrated testers, independent double review, and a lead auditor
            who has to reproduce a finding before it counts.
          </p>
        </MotionReveal>

        <MotionStagger className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
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
