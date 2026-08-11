'use client'

import { ArrowRight } from 'lucide-react'
import { MotionReveal, MotionStagger, MotionStaggerItem } from './motion-reveal'

export const ORIGIN_STAGES = [
  {
    name: 'Intake',
    detail: 'Scope modality, language, and deliverable with the buyer.',
  },
  {
    name: 'Task Forge',
    detail: 'Design collection tasks, rates, and reference templates.',
  },
  {
    name: 'Field Pool',
    detail: 'Activate location- and dialect-aware collector pools.',
  },
  {
    name: 'Capture',
    detail: 'Speech, text, or agri imagery, consent locked at submit.',
  },
  {
    name: 'Gatecheck',
    detail: 'Automated first-pass filters on quality and completeness.',
  },
  {
    name: 'Review Bench',
    detail: 'Human review with standardized defect tagging.',
  },
  {
    name: 'Payout Line',
    detail: 'Cleared contributions move to contributor payment rails.',
  },
  {
    name: 'Assembly',
    detail: 'Package structured datasets with manifests.',
  },
  {
    name: 'Provenance Seal',
    detail: 'Attach consent certificates and licensing provenance.',
  },
  {
    name: 'Handoff',
    detail: 'Encrypted delivery to the commissioning buyer.',
  },
] as const

export function OriginDeepDive() {
  return (
    <section
      id="origin"
      data-scroll-section
      className="py-16 sm:py-24 md:py-32 lg:py-36"
    >
      <div className="container-wide">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16 lg:items-end">
          <div className="lg:col-span-5">
            <MotionReveal>
              <p className="text-eyebrow text-accent">Oreset Origin</p>
              <h2 className="text-h1 mt-4 text-balance text-foreground">
                From capture to delivery.
              </h2>
              <p className="text-body-lg mt-5 text-pretty text-muted-foreground">
                Fresh African speech, language, and agricultural imagery, originated in the
                field, verified before delivery, and licensed from the point of capture.
              </p>
              <a
                href="#contact"
                className="group mt-8 inline-flex items-center gap-2 text-body-sm font-semibold text-accent transition-colors hover:text-copper-600"
              >
                Commission Origin data
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </MotionReveal>
          </div>

          <div className="lg:col-span-7">
            <MotionReveal delay={0.06}>
              <p className="text-caption font-semibold uppercase tracking-wider text-muted-foreground">
                10 stages
              </p>
            </MotionReveal>

            <MotionStagger className="mt-4 divide-y divide-border/70 border-y border-border/70" stagger={0.04}>
              {ORIGIN_STAGES.map((stage, idx) => (
                <MotionStaggerItem key={stage.name}>
                  <div className="flex gap-4 py-3.5 sm:gap-5 sm:py-4">
                    <span className="w-8 shrink-0 font-mono text-[11px] font-semibold tabular text-accent sm:w-9 sm:text-caption">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1 sm:grid sm:grid-cols-12 sm:gap-4">
                      <p className="font-display text-sm font-semibold tracking-tight text-foreground sm:col-span-4 sm:text-base">
                        {stage.name}
                      </p>
                      <p className="mt-0.5 text-body-sm text-muted-foreground sm:col-span-8 sm:mt-0">
                        {stage.detail}
                      </p>
                    </div>
                  </div>
                </MotionStaggerItem>
              ))}
            </MotionStagger>
          </div>
        </div>
      </div>
    </section>
  )
}
