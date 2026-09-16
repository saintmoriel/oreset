'use client'

import { MotionReveal, MotionStagger, MotionStaggerItem } from '@/components/motion-reveal'

const STEPS = [
  {
    number: '01',
    title: 'Scope',
    detail:
      "You tell us what your AI agent does, who it serves, and what decisions it makes. We design a test plan tailored to your agent's domain, risk profile, and deployment context.",
    duration: 'Phase 1',
  },
  {
    number: '02',
    title: 'Test',
    detail:
      "Our team runs hundreds of scenarios against your agent: adversarial attacks, edge cases, ambiguous inputs, multi-language interactions. We document every failure with evidence.",
    duration: 'Phase 2',
  },
  {
    number: '03',
    title: 'Fix and retest',
    detail:
      'Findings land in your dashboard as we confirm them, each with severity, business consequence, reproduction steps, and a specific fix. Your team patches, we retest for free, and the finding closes only when the fix holds.',
    duration: 'Phase 3',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border/60 py-16 sm:py-24 md:py-32 lg:py-36">
      <div className="container-wide">
        <MotionReveal>
          <p className="text-eyebrow text-accent">How it works</p>
          <h2 className="text-h1 mt-4 max-w-2xl text-balance text-foreground">
            One engagement. Live findings. Every fix verified.
          </h2>
          <p className="text-body-lg mt-5 max-w-2xl text-pretty text-muted-foreground">
            Engagements typically run 1-2 weeks. No integration required.
            No SDK to install. You give us access, we stress-test, and findings
            stream into your dashboard as we confirm them. Not a PDF at the end.
          </p>
        </MotionReveal>

        <MotionStagger className="mt-14 grid gap-8 lg:grid-cols-3" stagger={0.12}>
          {STEPS.map((s) => (
            <MotionStaggerItem key={s.number}>
              <div className="border-t border-border pt-6">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-accent/10 font-display text-sm font-bold text-accent">
                    {s.number}
                  </span>
                  <span className="text-body-sm font-medium text-muted-foreground">{s.duration}</span>
                </div>
                <h3 className="text-h3 mt-4 text-foreground">{s.title}</h3>
                <p className="text-body-sm mt-2 text-muted-foreground">{s.detail}</p>
              </div>
            </MotionStaggerItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  )
}
