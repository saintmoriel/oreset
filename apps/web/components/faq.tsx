'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MotionReveal } from './motion-reveal'

const faqs = [
  {
    audience: 'General',
    q: 'What exactly does Oreset test?',
    a: "Two things: can your AI agent be manipulated into doing something wrong (security), and does it make wrong decisions on its own without being attacked (judgment). Most security firms only cover the first half. We cover both, in one engagement.",
  },
  {
    audience: 'General',
    q: 'Is Oreset live yet?',
    a: "We're onboarding early partners now. If you're shipping an AI agent and want it stress-tested before launch, talk to us directly.",
  },
  {
    audience: 'Clients',
    q: 'How long does an engagement take?',
    a: "Engagements typically run 1-2 weeks depending on the agent's complexity and scope. No SDK to install. No integration required. You give us access, we stress-test, you get the report.",
  },
  {
    audience: 'Clients',
    q: 'What do I get at the end?',
    a: "A structured risk report: every failure found, its severity, the business consequence, and a specific fix recommendation. Actionable for your engineering team and legible for your leadership.",
  },
  {
    audience: 'Clients',
    q: 'Do you only test before launch?',
    a: "No. We test pre-launch, post-update, post-incident, and on a recurring basis. Any time your AI agent changes or you need confidence that it still works correctly.",
  },
  {
    audience: 'Clients',
    q: 'Can you test AI agents that handle African languages?',
    a: "Yes. We have particular depth in African languages including Pidgin, Hausa, Yoruba, Swahili, and Sheng. No other risk assessment firm covers these. But our testing is not limited to any language or market.",
  },
  {
    audience: 'General',
    q: 'Where is Oreset based?',
    a: 'Headquartered in Abuja, Nigeria. We test AI agents for companies anywhere.',
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
              For teams considering an engagement.
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