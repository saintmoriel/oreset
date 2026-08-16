'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MotionReveal } from './motion-reveal'

const ORIGIN_STAGES = [
  'Intake',
  'Task Forge',
  'Field Pool',
  'Capture',
  'Gatecheck',
  'Review Bench',
  'Payout Line',
  'Assembly',
  'Provenance Seal',
  'Handoff',
] as const

const OPERATOR_STAGES = [
  'Sourcing',
  'Training',
  'Certification',
  'Bench',
  'Placement',
  'Account Management',
] as const

const arms = [
  {
    id: 'origin',
    label: 'Oreset Origin',
    arm: 'Data arm',
    stages: ORIGIN_STAGES,
    stageCount: '10-stage pipeline',
    summary:
      'A distributed network of local collectors originates fresh African data, speech, language, and agricultural imagery, with consent and licensing built in from the point of capture.',
    buyers:
      'For AI labs, ASR/speech startups, agri-AI teams, and university NLP research labs buying against a project or grant deliverable.',
    image:
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Agricultural field ready for imagery capture, illustrative of Origin collection contexts',
    imageCaption: 'Agri imagery & speech capture contexts',
  },
  {
    id: 'operators',
    label: 'Oreset Operators',
    arm: 'Talent arm',
    stages: OPERATOR_STAGES,
    stageCount: '6-stage track',
    summary:
      'Recruits, trains, and certifies native-language-fluent professionals for AI-assisted review, correction, and QA, then places them with teams whose live products need ongoing native-language support.',
    buyers:
      'For enterprise ops and product leads with a recurring staffing budget for native-language evaluation.',
    image:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Professionals collaborating at a review workstation, illustrative of operator QA work',
    imageCaption: 'Operator training & review workstations',
  },
] as const

export function TwoArms() {
  const [active, setActive] = useState(0)
  const [hoveredStage, setHoveredStage] = useState<number | null>(null)
  const reduceMotion = useReducedMotion()
  const current = arms[active]

  return (
    <section id="arms" className="border-t border-border/60 bg-secondary/40 py-24 md:py-32 lg:py-36">
      <div className="container-wide">
        <MotionReveal>
          <div className="max-w-2xl">
            <p className="text-eyebrow text-accent">Two arms · one ledger</p>
            <h2 className="text-h1 mt-4 text-balance text-foreground">
              How Oreset is structured.
            </h2>
            <p className="text-body-lg mt-5 text-pretty text-muted-foreground">
              Origin and Operators share one origination engine and one trust-verification
              philosophy, reliability is earned before higher-stakes work is unlocked.
            </p>
          </div>
        </MotionReveal>

        <MotionReveal delay={0.1}>
          <div
            role="tablist"
            aria-label="Oreset arms"
            className="mt-10 inline-flex rounded-xl border border-border/80 bg-card p-1 shadow-sm"
          >
            {arms.map((arm, i) => (
              <button
                key={arm.id}
                type="button"
                role="tab"
                id={`arm-tab-${arm.id}`}
                aria-selected={active === i}
                aria-controls={`arm-panel-${arm.id}`}
                onClick={() => {
                  setActive(i)
                  setHoveredStage(null)
                }}
                className={cn(
                  'rounded-lg px-4 py-2.5 text-body-sm font-semibold transition-colors sm:px-5',
                  active === i
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {arm.label}
              </button>
            ))}
          </div>
        </MotionReveal>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              id={`arm-panel-${current.id}`}
              role="tabpanel"
              aria-labelledby={`arm-tab-${current.id}`}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-8 lg:grid-cols-12 lg:gap-10"
            >
              <div className="lg:col-span-5">
                <figure className="card-surface overflow-hidden">
                  <div className="photo-brand photo-brand-soft aspect-[4/3]">
                    <img
                      src={current.image}
                      alt={current.imageAlt}
                      width={900}
                      height={675}
                      className="absolute inset-0"
                    />
                  </div>
                  <figcaption className="flex items-center gap-2 border-t border-border/60 px-4 py-3 text-caption text-muted-foreground">
                    <span className="motif-dot shrink-0" aria-hidden="true" />
                    {current.imageCaption}
                  </figcaption>
                </figure>
              </div>

              <div className="flex flex-col lg:col-span-7">
                <p className="text-eyebrow text-accent">{current.arm}</p>
                <h3 className="text-h2 mt-2 text-foreground">{current.label}</h3>
                <p className="text-body mt-4 text-muted-foreground">{current.summary}</p>
                <p className="text-body-sm mt-3 text-muted-foreground/90">{current.buyers}</p>

                <div className="mt-8">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-caption font-semibold uppercase tracking-wider text-muted-foreground">
                      {current.stageCount}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      Hover a stage to focus
                    </p>
                  </div>

                  <ol className="mt-4 flex flex-wrap gap-2">
                    {current.stages.map((stage, idx) => {
                      const focused = hoveredStage === null || hoveredStage === idx
                      return (
                        <li key={stage}>
                          <button
                            type="button"
                            onMouseEnter={() => setHoveredStage(idx)}
                            onMouseLeave={() => setHoveredStage(null)}
                            onFocus={() => setHoveredStage(idx)}
                            onBlur={() => setHoveredStage(null)}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-caption font-medium transition-[opacity,border-color,background-color,transform] duration-200',
                              hoveredStage === idx
                                ? 'border-accent bg-copper-50 text-foreground shadow-sm'
                                : 'border-border/80 bg-card text-foreground',
                              !focused && 'opacity-40',
                            )}
                          >
                            <span className="font-mono text-[10px] font-semibold tabular text-accent">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            {stage}
                          </button>
                        </li>
                      )
                    })}
                  </ol>

                  {/* Horizontal step tracker for desktop */}
                  <div className="mt-6 hidden overflow-x-auto pb-1 md:block" aria-hidden="true">
                    <div className="flex min-w-max items-center gap-0">
                      {current.stages.map((stage, idx) => (
                        <div key={stage} className="flex items-center">
                          <div
                            className={cn(
                              'flex size-2.5 items-center justify-center rounded-full transition-colors',
                              hoveredStage === idx ? 'bg-accent' : 'bg-navy-300',
                            )}
                          />
                          {idx < current.stages.length - 1 && (
                            <div
                              className={cn(
                                'h-px w-6 lg:w-8',
                                hoveredStage !== null &&
                                  (hoveredStage === idx || hoveredStage === idx + 1)
                                  ? 'bg-accent/60'
                                  : 'bg-border',
                              )}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <a
                  href="#contact"
                  className="mt-8 inline-flex w-fit items-center gap-2 text-body-sm font-semibold text-accent transition-colors hover:text-copper-600"
                >
                  Partner on {current.label}
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}