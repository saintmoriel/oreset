'use client'

import { Shield, Brain, AlertTriangle } from 'lucide-react'
import { MotionReveal, MotionStagger, MotionStaggerItem } from '@/components/motion-reveal'

const DIMENSIONS = [
  {
    icon: Shield,
    title: 'Security',
    subtitle: 'Can your AI be manipulated?',
    tests: [
      'Prompt injection and jailbreaking',
      'Data extraction and leakage',
      'Role manipulation and privilege escalation',
      'Adversarial inputs designed to bypass guardrails',
    ],
  },
  {
    icon: Brain,
    title: 'Judgment',
    subtitle: 'Does your AI make wrong decisions on its own?',
    tests: [
      'Edge cases that expose faulty reasoning',
      'Ambiguous inputs that reveal unstable behavior',
      'Domain-specific scenarios with known correct answers',
      'Multi-language inputs including African languages',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Impact',
    subtitle: 'What happens when it fails?',
    tests: [
      'Business consequence of each failure',
      'Legal and regulatory exposure',
      'Reputational risk assessment',
      'Severity classification with fix priority',
    ],
  },
]

export function WhatWeTest() {
  return (
    <section id="what-we-test" className="border-t border-border/60 bg-secondary/35 py-16 sm:py-24 md:py-32 lg:py-36">
      <div className="container-wide">
        <MotionReveal>
          <p className="text-eyebrow text-accent">What we test</p>
          <h2 className="text-h1 mt-4 max-w-2xl text-balance text-foreground">
            Security tells you half the story. We tell you the rest.
          </h2>
          <p className="text-body-lg mt-5 max-w-2xl text-pretty text-muted-foreground">
            Every engagement covers three dimensions. You get a single report
            that shows what breaks, how badly, and what to fix first.
          </p>
        </MotionReveal>

        <MotionStagger className="mt-12 grid gap-8 lg:grid-cols-3" staggerDelay={0.1}>
          {DIMENSIONS.map((d) => (
            <MotionStaggerItem key={d.title}>
              <div className="card-surface flex h-full flex-col overflow-hidden">
                <div className="border-b border-border/60 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
                      <d.icon className="size-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-h4 text-foreground">{d.title}</p>
                      <p className="text-body-sm text-muted-foreground">{d.subtitle}</p>
                    </div>
                  </div>
                </div>
                <ul className="flex-1 space-y-3 px-6 py-5">
                  {d.tests.map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-body-sm text-muted-foreground">
                      <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </MotionStaggerItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  )
}
