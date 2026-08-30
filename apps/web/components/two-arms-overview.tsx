'use client'

import { MotionReveal, MotionStagger, MotionStaggerItem } from './motion-reveal'

const steps = [
  {
    id: 'capture',
    number: '01',
    label: 'Capture the real exchange',
    summary:
      'Not a clean translation. The actual conversation: code-switching, Pidgin, mixed register. The way people really speak, not the way a textbook does.',
  },
  {
    id: 'separate',
    number: '02',
    label: 'Separate understanding from outcome',
    summary:
      'Two different questions, checked independently: did the AI understand correctly, and separately, was the decision that followed actually right. A model can pass one and fail the other.',
  },
  {
    id: 'route',
    number: '03',
    label: 'Route to a certified, domain-matched reviewer',
    summary:
      'Not just fluent in the language. Calibrated to the domain: claims, lending, service eligibility. So the review catches what generic language QA misses.',
  },
  {
    id: 'score',
    number: '04',
    label: 'Score the gap, not just flag it',
    summary:
      'Severity-weighted: did the language failure change the outcome, or was it cosmetic. That distinction is what makes a finding actionable instead of vague.',
  },
  {
    id: 'deliver',
    number: '05',
    label: 'Deliver evidence, not a report',
    summary:
      'A specific, reproducible trace: this exchange, this language, this wrong decision, here is what correct looks like.',
  },
]

export function TwoArmsOverview() {
  return (
    <section
      id="engine"
      data-scroll-section
      className="border-t border-border/60 bg-secondary/40 py-16 sm:py-24 md:py-32"
    >
      <div className="container-wide">
        <MotionReveal>
          <div className="max-w-2xl">
            <p className="text-eyebrow text-accent">How we verify a decision</p>
            <h2 className="text-h1 mt-4 text-balance text-foreground">
              One engine, five steps.
            </h2>
            <p className="text-body-lg mt-5 text-pretty text-muted-foreground">
              Not two separate services. One continuous verification, from the real exchange to
              the evidence in your hands.
            </p>
          </div>
        </MotionReveal>

        <MotionStagger className="mt-10 grid gap-5 sm:mt-12 sm:gap-6 lg:grid-cols-5" stagger={0.1}>
          {steps.map((step) => (
            <MotionStaggerItem key={step.id}>
              <article className="card-surface-raised group flex h-full flex-col p-5 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_24px_60px_rgba(22,33,58,0.16)] sm:p-6">
                <p className="font-mono text-xs font-semibold text-accent">{step.number}</p>
                <h3 className="text-h4 mt-3 text-foreground">{step.label}</h3>
                <p className="text-body-sm mt-3 text-muted-foreground">{step.summary}</p>
              </article>
            </MotionStaggerItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  )
}