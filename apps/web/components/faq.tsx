'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MotionReveal } from './motion-reveal'

const faqs = [
  {
    audience: 'Everyone',
    q: 'Is Oreset live yet?',
    a: 'Oreset is pre-revenue and building through real cases, not a self-serve product with instant signup. If you have a decision you need checked, talk to us directly.',
  },
  {
    audience: 'Buyers',
    q: 'How does verification actually work?',
    a: "We check two things separately, not one blended score: did the AI correctly understand what the user meant, and separately, was the decision that followed actually correct. A model can pass one and fail the other — that's the gap most evaluation misses.",
  },
  {
    audience: 'Buyers',
    q: 'How are reviewers certified?',
    a: 'Reviewers move through Sourcing → Training → Certification before joining the Bench. Training covers dialect baselines, error taxonomy, calibration scoring, and timed evaluation. Higher-stakes cases require earned reliability scorecards — matched by language and domain, not language alone.',
  },
  {
    audience: 'Contributors',
    q: 'How do collectors and reviewers get paid?',
    a: 'Compensation is designed around explicit rates and a wage floor, not opaque piece rates. Exact terms are set per case or account arrangement.',
  },
  {
    audience: 'Buyers',
    q: 'Which languages and decision types do you cover?',
    a: 'Coverage is scoped per case: we start from the language and decision type you bring us — claims, lending, government services, or another decision-driven AI product. We do not publish inflated "N languages live" counts; we verify against real examples, not assumed coverage.',
  },
  {
    audience: 'Everyone',
    q: 'How is data consent handled, if you need fresh data for a case?',
    a: 'Digital consent is required before a collector can submit a capture. Licensing and provenance travel with the data via the Shared Trust Ledger, not as paperwork after the fact.',
  },
  {
    audience: 'Contributors',
    q: 'Do I need special equipment to contribute?',
    a: 'No. The Oreset Capture app runs on standard Android smartphones. Tasks are designed for on-device recording with built-in quality gates — you don’t need studio hardware or professional training.',
  },
  {
    audience: 'Buyers',
    q: 'What happens if a delivery fails quality checks?',
    a: 'Every batch passes automated gatechecks and reviewer sign-off before handoff. If a delivery falls below the agreed quality threshold, we re-collect or replace at no additional cost. The Trust Ledger audit trail shows exactly where any issue occurred.',
  },
  {
    audience: 'Everyone',
    q: 'Where is Oreset based?',
    a: 'Oreset Africa Hub is based in Abuja, Nigeria. The reviewer network is designed for distributed placement across African language communities.',
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  const reduceMotion = useReducedMotion()

  return (
    <section id="faq" className="py-16 sm:py-24 md:py-32 lg:py-36">
      <div className="container-wide">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <MotionReveal className="lg:col-span-4">
            <p className="text-eyebrow text-accent">FAQ</p>
            <h2 className="text-h1 mt-4 text-balance text-foreground">
              Straight answers.
            </h2>
            <p className="text-body mt-4 text-muted-foreground">
              Honest to stage, for buyers, reviewers, and field collectors.
            </p>
          </MotionReveal>

          <div className="lg:col-span-8">
            <ul className="divide-y divide-border/80 border-y border-border/80">
              {faqs.map((item, i) => {
                const isOpen = open === i
                return (
                  <li key={item.q}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-start justify-between gap-4 py-5 text-left transition-colors hover:text-accent md:py-6"
                    >
                      <span>
                        <span className="text-caption font-semibold uppercase tracking-eyebrow text-muted-foreground">
                          {item.audience}
                        </span>
                        <span className="mt-1 block text-h4 text-foreground">{item.q}</span>
                      </span>
                      <ChevronDown
                        className={cn(
                          'mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-200',
                          isOpen && 'rotate-180 text-accent',
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="pb-5 text-body text-muted-foreground md:pb-6 md:pr-12">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}