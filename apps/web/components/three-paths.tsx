'use client'

import { MotionReveal, MotionStagger, MotionStaggerItem } from './motion-reveal'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { openPilotModal } from './pilot-scoping-modal'

export function ThreePaths() {
  return (
    <section id="paths" className="py-16 sm:py-24 md:py-32 border-t border-border/60 relative overflow-hidden">
      <div className="container-wide">
        <MotionReveal>
          <div className="max-w-2xl mb-12 md:mb-16">
            <p className="text-eyebrow text-accent">Three paths in</p>
            <h2 className="text-h1 mt-4 text-balance text-foreground">How you work with Oreset.</h2>
            <p className="text-body-lg mt-5 text-pretty text-muted-foreground">
              Whether you contribute data, certify as an operator, or commission deliverables — every path runs through the same trust infrastructure.
            </p>
          </div>
        </MotionReveal>

        <MotionStagger className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Card 1 */}
          <MotionStaggerItem>
            <div className="card-surface-raised h-full flex flex-col p-6 sm:p-8 relative">
              <div className="mb-8">
                <div className="font-mono text-accent text-sm mb-4">01</div>
                <h3 className="text-h3 text-foreground mb-2">Contribute field data</h3>
                <p className="text-body-sm text-muted-foreground">For collectors and language communities</p>
              </div>

              <ol className="space-y-4 mb-10 flex-grow">
                {[
                  "Download the Oreset Capture app",
                  "Accept a task from the pool (speech, image, or text)",
                  "Record with on-device consent and quality gates",
                  "Cleared contributions move to Payout Line"
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-body-sm">
                    <span className="font-mono text-accent/70 mt-0.5 shrink-0">{i + 1}.</span>
                    <span className="text-foreground/80">{step}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-auto">
                <Link href="/capture" className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-accent hover:text-copper-600 transition-colors group/cta">
                  Start contributing
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/cta:translate-x-1" />
                </Link>
              </div>
            </div>
          </MotionStaggerItem>

          {/* Card 2 */}
          <MotionStaggerItem>
            <div className="card-surface-raised h-full flex flex-col p-6 sm:p-8 relative">
              <div className="mb-8">
                <div className="font-mono text-accent text-sm mb-4">02</div>
                <h3 className="text-h3 text-foreground mb-2">Become a Certified Operator</h3>
                <p className="text-body-sm text-muted-foreground">For native-language professionals</p>
              </div>

              <ol className="space-y-4 mb-10 flex-grow">
                {[
                  "Apply through Scout intake",
                  "Complete Foundry training: Pacing, Clarity, Spontaneity",
                  "Pass timed Certify evaluation (≥90%, zero critical errors)",
                  "Join the Bench for enterprise matching"
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-body-sm">
                    <span className="font-mono text-accent/70 mt-0.5 shrink-0">{i + 1}.</span>
                    <span className="text-foreground/80">{step}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-auto">
                <Link href="/operators/join" className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-accent hover:text-copper-600 transition-colors group/cta">
                  Apply to the cohort
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/cta:translate-x-1" />
                </Link>
              </div>
            </div>
          </MotionStaggerItem>

          {/* Card 3 */}
          <MotionStaggerItem>
            <div className="card-surface-raised h-full flex flex-col p-6 sm:p-8 relative">
              <div className="mb-8">
                <div className="font-mono text-accent text-sm mb-4">03</div>
                <h3 className="text-h3 text-foreground mb-2">Commission a dataset</h3>
                <p className="text-body-sm text-muted-foreground">For AI labs and enterprise buyers</p>
              </div>

              <ol className="space-y-4 mb-10 flex-grow">
                {[
                  "Scope languages, modalities, and batch size",
                  "We activate a field pool with matched collectors",
                  "Automated gatechecks + operator review before delivery",
                  "Receive packages with consent licensing and provenance"
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-body-sm">
                    <span className="font-mono text-accent/70 mt-0.5 shrink-0">{i + 1}.</span>
                    <span className="text-foreground/80">{step}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-auto">
                <button onClick={() => openPilotModal()} className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-accent hover:text-copper-600 transition-colors group/cta text-left">
                  Scope a pilot
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/cta:translate-x-1" />
                </button>
              </div>
            </div>
          </MotionStaggerItem>
        </MotionStagger>
      </div>
    </section>
  )
}
