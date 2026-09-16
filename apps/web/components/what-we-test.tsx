'use client'

import { Shield, Brain, AlertTriangle } from 'lucide-react'
import { MotionReveal, MotionStagger, MotionStaggerItem } from '@/components/motion-reveal'

const DIMENSIONS = [
  {
    icon: Shield,
    title: 'Security',
    subtitle: 'Can your AI be manipulated?',
    tests: [
      'Direct and indirect prompt injection, including through documents and tool results',
      'Sensitive data disclosure: system prompts, other users, internal records',
      'Excessive agency: tool calls the agent was never authorised to make',
      'Guardrail bypass through role-play, encoding, and multi-turn escalation',
    ],
  },
  {
    icon: Brain,
    title: 'Judgment',
    subtitle: 'Does your AI make wrong decisions on its own?',
    tests: [
      'Irreversible actions taken on a plausible request with no verification',
      'Decisions that shift under pressure, urgency, or threats to churn',
      'Ambiguous, incomplete, or multilingual inputs, including low-resource languages',
      'Hallucinated business actions: promises, policies, and refunds that do not exist',
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
            Every engagement covers three dimensions. Findings show what
            breaks, how badly, and what to fix first, then we verify the fix.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-body-sm text-muted-foreground">Findings classified against</span>
            <span className="rounded-md border border-border bg-card px-2.5 py-1 font-mono text-xs font-semibold text-foreground">
              OWASP Top 10 for LLM Applications
            </span>
            <span className="rounded-md border border-border bg-card px-2.5 py-1 font-mono text-xs font-semibold text-foreground">
              P0 to P3 severity
            </span>
          </div>
        </MotionReveal>

        <MotionStagger className="mt-12 grid gap-8 lg:grid-cols-3" stagger={0.1}>
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
