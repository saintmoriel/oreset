'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { MotionReveal, MotionStagger, MotionStaggerItem } from './motion-reveal'

const pillars = [
  {
    title: 'Consent-linked licensing',
    detail:
      'Every field capture requires digital consent before submission. Licensing rights travel with the data, not bolted on at delivery.',
  },
  {
    title: 'Reviewer reliability scorecards',
    detail:
      'Certification, calibration thresholds, and ongoing review telemetry unlock higher-stakes cases. Reliability is earned, not assumed.',
  },
  {
    title: 'Wage-floor compliance',
    detail:
      'Payout rails and oversight are designed so collector and reviewer compensation is visible, timely, and held to an explicit floor, not opaque gig rates.',
  },
]

const ledgerRows = [
  { label: 'Consent lock', meta: 'Capture' },
  { label: 'Reliability score', meta: 'Review' },
  { label: 'Wage floor', meta: 'Both stages' },
]

function TrustDiagram() {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border/70 bg-secondary/40"
      role="img"
      aria-label="Shared Trust Ledger connecting capture and review under one verification engine"
    >
      {/* Soft brand atmosphere */}
      <div
        className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-copper-100/50 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-10 size-48 rounded-full bg-navy-100/60 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative p-5 sm:p-7">
        {/* Two stages of one engine, not two arms */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <ArmCard
            eyebrow="When fresh data is needed"
            title="Capture"
            stages={10}
            delay={0}
            reduceMotion={!!reduceMotion}
          />
          <ArmCard
            eyebrow="Every case, always"
            title="Review"
            stages={6}
            delay={0.08}
            reduceMotion={!!reduceMotion}
          />
        </div>

        {/* Converging connectors */}
        <div className="relative mx-auto h-14 w-full max-w-[280px] sm:h-16" aria-hidden="true">
          <svg viewBox="0 0 280 64" className="h-full w-full" fill="none">
            <motion.path
              d="M70 0 C70 28, 140 28, 140 64"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.7 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.path
              d="M210 0 C210 28, 140 28, 140 64"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.7 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            />
            {!reduceMotion && (
              <>
                <motion.path
                  d="M70 0 C70 28, 140 28, 140 64"
                  stroke="var(--accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="6 14"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0], strokeDashoffset: [20, 0] }}
                  transition={{
                    duration: 2.2,
                    delay: 1.1,
                    repeat: Infinity,
                    repeatType: 'loop',
                    ease: 'linear',
                  }}
                />
                <motion.path
                  d="M210 0 C210 28, 140 28, 140 64"
                  stroke="var(--accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="6 14"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0], strokeDashoffset: [20, 0] }}
                  transition={{
                    duration: 2.2,
                    delay: 1.4,
                    repeat: Infinity,
                    repeatType: 'loop',
                    ease: 'linear',
                  }}
                />
              </>
            )}
            <motion.circle
              cx="140"
              cy="64"
              r="3.5"
              fill="var(--accent)"
              initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.75 }}
            />
            {!reduceMotion && (
              <motion.circle
                cx="140"
                cy="64"
                r="3.5"
                fill="var(--accent)"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, delay: 1.6, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
          </svg>
        </div>

        {/* Ledger core */}
        <motion.div
          className="overflow-hidden rounded-xl bg-ink text-ink-foreground shadow-[0_16px_40px_rgba(18,32,58,0.28)]"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center justify-between border-b border-ink-border px-4 py-3.5 sm:px-5">
            <div className="flex items-center gap-2.5">
              {/* Logo-language peak mark */}
              <span className="relative flex size-7 items-center justify-center" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M9 2.5 L14.5 14 H3.5 Z"
                    stroke="#f4f6fa"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path d="M6.2 14 L8.2 9.2" stroke="#c56a32" strokeWidth="1.6" strokeLinecap="round" />
                  <circle cx="12.2" cy="13.2" r="1.4" fill="#c56a32" />
                </svg>
              </span>
              <div>
                <p className="text-body-sm font-semibold tracking-tight text-ink-foreground">
                  Shared Trust Ledger
                </p>
                <p className="text-[11px] text-ink-muted">Verification backbone</p>
              </div>
            </div>
            <span className="hidden rounded-full border border-ink-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-copper-300 sm:inline">
              End-to-end
            </span>
          </div>

          <ul className="divide-y divide-ink-border">
            {ledgerRows.map((row, i) => (
              <motion.li
                key={row.label}
                className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5"
                initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: 0.45 + i * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
                  <span className="text-body-sm font-medium text-ink-foreground">{row.label}</span>
                </div>
                <span className="text-caption text-ink-muted">{row.meta}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  )
}

function ArmCard({
  eyebrow,
  title,
  stages,
  delay,
  reduceMotion,
}: {
  eyebrow: string
  title: string
  stages: number
  delay: number
  reduceMotion: boolean
}) {
  return (
    <motion.div
      className="rounded-xl border border-border/80 bg-card p-4 shadow-[0_1px_2px_rgba(22,33,58,0.04)] sm:p-5"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-eyebrow text-accent">{eyebrow}</p>
      <p className="mt-1.5 font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        {title}
      </p>
      <div className="mt-3 flex flex-wrap gap-1" aria-hidden="true">
        {Array.from({ length: stages }).map((_, i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-navy-300"
            style={{ opacity: 0.45 + (i / stages) * 0.55 }}
          />
        ))}
      </div>
      <p className="mt-2.5 text-caption text-muted-foreground">
        {stages}-stage {title === 'Capture' ? 'pipeline' : 'track'}
      </p>
    </motion.div>
  )
}

export function TrustLedger() {
  return (
    <section id="trust" className="border-t border-border/60 py-16 sm:py-24 md:py-32 lg:py-36">
      <div className="container-wide">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <MotionReveal>
              <p className="text-eyebrow text-accent">How it works</p>
              <h2 className="text-h1 mt-4 text-balance text-foreground">
                Shared Trust Ledger.
              </h2>
              <p className="text-body-lg mt-5 text-pretty text-muted-foreground">
                The credibility backbone behind every case, so buyers can audit provenance,
                and collectors and reviewers are treated as professionals, not disposable labor.
              </p>
            </MotionReveal>

            <MotionStagger className="mt-10 divide-y divide-border/70" stagger={0.07}>
              {pillars.map((pillar) => (
                <MotionStaggerItem key={pillar.title}>
                  <div className="flex gap-4 py-6 first:pt-0">
                    <span className="mt-1.5 flex size-6 shrink-0 items-center justify-center">
                      <span className="motif-dot" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-h4 text-foreground">{pillar.title}</h3>
                      <p className="text-body-sm mt-2 text-muted-foreground">{pillar.detail}</p>
                    </div>
                  </div>
                </MotionStaggerItem>
              ))}
            </MotionStagger>
          </div>

          <MotionReveal delay={0.12} className="lg:col-span-6">
            <TrustDiagram />
            <p className="mt-3 px-1 text-caption text-muted-foreground">
              Structural model. Reliability gates unlock higher-stakes cases at every stage of
              the engine, not just at the end.
            </p>
          </MotionReveal>
        </div>
      </div>
    </section>
  )
}