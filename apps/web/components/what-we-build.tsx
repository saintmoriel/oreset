'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Database,
  Users,
  ShieldCheck,
  Mic,
  FileCheck2,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MotionReveal, MotionStagger, MotionStaggerItem } from './motion-reveal'

const tabs = [
  {
    id: 'origin',
    label: 'Oreset Origin',
    eyebrow: 'Data arm',
    icon: Database,
    summary:
      'A 10-stage consented origination lifecycle, from scoping and field collection through validation, payment, licensing, and delivery.',
    stages: [
      'Scoping',
      'Task design',
      'Pool activation',
      'Collection',
      'Auto-validation',
      'Quality review',
      'Payment',
      'Aggregation',
      'Licensing',
      'Delivery',
    ],
    panels: [
      {
        title: 'Field origination',
        detail: 'Location-aware task feeds, in-browser audio/image capture, mandatory consent before submit.',
        icon: Mic,
      },
      {
        title: 'Operations studio',
        detail: 'Campaign design, two-pass review queues, encrypted delivery vaults with consent certificates.',
        icon: FileCheck2,
      },
    ],
  },
  {
    id: 'operators',
    label: 'Oreset Operators',
    eyebrow: 'Talent arm',
    icon: Users,
    summary:
      'A 6-stage certified talent pipeline, sourcing, training, calibration, bench matching, placement, and account management.',
    stages: ['Sourcing', 'Training', 'Certification', 'Bench', 'Placement', 'Account mgmt'],
    panels: [
      {
        title: 'LMS & certification',
        detail: 'Dialect baselines, timed sprint workbench, ERR-01-04 taxonomy, ≥90% calibration gate.',
        icon: GraduationCap,
      },
      {
        title: 'Enterprise bench',
        detail: 'Availability matching by language and domain, live IAA telemetry, escalation queues.',
        icon: Users,
      },
    ],
  },
]

const trustSteps = [
  {
    n: '01',
    title: 'Automated gatechecks',
    detail: 'Sample-rate, resolution, and noise-floor filters clear raw inputs before human review.',
    icon: ShieldCheck,
  },
  {
    n: '02',
    title: 'Two-pass taxonomy',
    detail: 'Senior leads tag factual, linguistic, cultural, and domain errors on a 5-point scale.',
    icon: CheckCircle2,
  },
  {
    n: '03',
    title: 'Trust ledger',
    detail: 'Consent locks, encrypted packages, and audit-ready manifests for every delivery.',
    icon: FileCheck2,
  },
]

export function WhatWeBuild() {
  const [active, setActive] = useState(0)
  const reduceMotion = useReducedMotion()
  const current = tabs[active]

  return (
    <section id="build" className="border-t border-border/60 bg-secondary/35 py-24 md:py-32 lg:py-36">
      <div className="container-wide">
        <MotionReveal>
          <div className="max-w-2xl">
            <p className="text-eyebrow text-accent">What we build</p>
            <h2 className="text-h1 mt-4 text-balance text-foreground">
              Two arms. One rigorous network.
            </h2>
            <p className="text-body-lg mt-5 text-pretty text-muted-foreground">
              Product surfaces for field data and certified operators, designed so contributors
              get paid fairly and buyers get audit-ready quality.
            </p>
          </div>
        </MotionReveal>

        <MotionReveal delay={0.1}>
          <div className="mt-12 flex flex-col gap-8 lg:mt-14 lg:flex-row lg:gap-10">
            <div
              role="tablist"
              aria-label="Network arms"
              className="flex shrink-0 flex-row gap-2 lg:w-56 lg:flex-col"
            >
              {tabs.map((tab, i) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active === i}
                  id={`tab-${tab.id}`}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => setActive(i)}
                  className={cn(
                    'flex flex-1 items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors duration-200 lg:flex-none',
                    active === i
                      ? 'bg-foreground text-background shadow-sm'
                      : 'bg-card/80 text-muted-foreground hover:bg-card hover:text-foreground',
                  )}
                >
                  <tab.icon className="size-4 shrink-0" aria-hidden="true" />
                  <span>
                    <span className="block text-body-sm font-semibold leading-tight">{tab.label}</span>
                    <span
                      className={cn(
                        'mt-0.5 block text-caption',
                        active === i ? 'text-background/65' : 'text-muted-foreground/80',
                      )}
                    >
                      {tab.eyebrow}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div className="min-w-0 flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  id={`panel-${current.id}`}
                  role="tabpanel"
                  aria-labelledby={`tab-${current.id}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="card-surface-raised overflow-hidden"
                >
                  <div className="border-b border-border/60 bg-card px-5 py-5 md:px-8 md:py-6">
                    <div className="flex items-center gap-2">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-accent/10">
                        <current.icon className="size-4 text-accent" aria-hidden="true" />
                      </span>
                      <p className="text-eyebrow text-accent">{current.eyebrow}</p>
                    </div>
                    <h3 className="text-h2 mt-3 text-foreground">{current.label}</h3>
                    <p className="text-body mt-3 max-w-2xl text-muted-foreground">{current.summary}</p>
                  </div>

                  <div className="bg-secondary/30 px-5 py-5 md:px-8">
                    <p className="text-caption font-semibold uppercase tracking-wider text-muted-foreground">
                      Lifecycle
                    </p>
                    <ol className="mt-3 flex flex-wrap gap-2">
                      {current.stages.map((stage, idx) => (
                        <li
                          key={stage}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-3 py-1 text-caption font-medium text-foreground"
                        >
                          <span className="font-mono text-[10px] font-semibold tabular text-accent">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          {stage}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="grid gap-0 sm:grid-cols-2">
                    {current.panels.map((panel, i) => (
                      <div
                        key={panel.title}
                        className={cn(
                          'border-t border-border/60 p-5 md:p-6',
                          i === 0 && 'sm:border-r',
                        )}
                      >
                        <panel.icon className="size-4 text-accent" aria-hidden="true" />
                        <h4 className="text-h4 mt-3 text-foreground">{panel.title}</h4>
                        <p className="text-body-sm mt-2 text-muted-foreground">{panel.detail}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end border-t border-border/60 px-5 py-4 md:px-8">
                    <a
                      href="#contact"
                      className="group inline-flex items-center gap-2 text-body-sm font-semibold text-accent transition-colors hover:text-copper-600"
                    >
                      Talk to us about {current.label}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </MotionReveal>

        {/* Trust backbone */}
        <div className="mt-20 md:mt-24">
          <MotionReveal>
            <div className="max-w-xl">
              <p className="text-eyebrow text-accent">Shared trust ledger</p>
              <h3 className="text-h2 mt-3 text-foreground">Quality proven at every step.</h3>
            </div>
          </MotionReveal>

          <MotionStagger className="mt-10 grid gap-0 md:grid-cols-3" stagger={0.07}>
            {trustSteps.map((step, i) => (
              <MotionStaggerItem key={step.n}>
                <div
                  className={cn(
                    'relative h-full p-6 md:p-8',
                    i < trustSteps.length - 1 && 'md:border-r md:border-border/60',
                    i > 0 && 'border-t border-border/60 md:border-t-0',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
                      <step.icon className="size-4 text-accent" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-caption text-muted-foreground/50">{step.n}</span>
                  </div>
                  <h4 className="text-h4 mt-5 text-foreground">{step.title}</h4>
                  <p className="text-body-sm mt-2 text-muted-foreground">{step.detail}</p>
                </div>
              </MotionStaggerItem>
            ))}
          </MotionStagger>
        </div>
      </div>
    </section>
  )
}
