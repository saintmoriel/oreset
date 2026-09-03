'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import { MotionReveal, MotionStagger, MotionStaggerItem } from './motion-reveal'
import { openPilotModal, PilotScopingModal } from './pilot-scoping-modal'

export type SolutionPageData = {
  vertical: string
  headline: string
  subheadline: string
  problem: {
    title: string
    description: string
    consequences: { scenario: string; impact: string }[]
  }
  howItWorks: {
    steps: { label: string; detail: string }[]
  }
  exampleCase: {
    title: string
    input: string
    failure: string
    caught: string
    severity: string
  }
  evidence: {
    stat: string
    source: string
    detail: string
  }[]
}

export function SolutionPageLayout({ data }: { data: SolutionPageData }) {
  return (
    <>
    <PilotScopingModal />
    <div className="min-h-svh overflow-y-auto bg-background">
      {/* Header */}
      <header className="border-b border-border/70 bg-card/80 backdrop-blur-md">
        <div className="container-wide flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Oreset home">
            <span className="flex size-8 overflow-hidden rounded-md bg-paper-200">
              <Image src="/oreset-logo v2.png" alt="" width={32} height={32} className="size-8" />
            </span>
            <span className="font-display text-lg font-semibold tracking-display">Oreset</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to site
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border/60 bg-ink py-20 sm:py-28 md:py-32">
        <div className="container-wide">
          <MotionReveal>
            <p className="text-eyebrow text-accent">{data.vertical}</p>
            <h1 className="text-h1 mt-4 max-w-3xl text-balance text-white">
              {data.headline}
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/70 sm:text-lg">
              {data.subheadline}
            </p>
          </MotionReveal>
        </div>
      </section>

      {/* Problem section */}
      <section className="border-b border-border/60 py-16 sm:py-24">
        <div className="container-wide">
          <MotionReveal>
            <p className="text-eyebrow text-accent">The cost of getting it wrong</p>
            <h2 className="text-h2 mt-4 max-w-2xl text-foreground">{data.problem.title}</h2>
            <p className="mt-4 max-w-2xl text-body-lg text-muted-foreground">
              {data.problem.description}
            </p>
          </MotionReveal>

          <MotionStagger className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.problem.consequences.map((c, i) => (
              <MotionStaggerItem key={i}>
                <div className="card-surface h-full p-6">
                  <p className="text-body font-semibold text-foreground">{c.scenario}</p>
                  <p className="mt-2 text-body-sm text-muted-foreground">{c.impact}</p>
                </div>
              </MotionStaggerItem>
            ))}
          </MotionStagger>
        </div>
      </section>

      {/* How verification works */}
      <section className="border-b border-border/60 bg-secondary/35 py-16 sm:py-24">
        <div className="container-wide">
          <MotionReveal>
            <p className="text-eyebrow text-accent">How verification works</p>
            <h2 className="text-h2 mt-4 text-foreground">Two checks, not one</h2>
            <p className="mt-4 max-w-2xl text-body-lg text-muted-foreground">
              Understanding and outcome are scored separately. A decision can be linguistically fluent and still wrong.
            </p>
          </MotionReveal>

          <MotionStagger className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {data.howItWorks.steps.map((step, i) => (
              <MotionStaggerItem key={i}>
                <div className="flex h-full flex-col bg-background p-6">
                  <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, '0')}</span>
                  <p className="mt-3 text-body font-semibold text-foreground">{step.label}</p>
                  <p className="mt-2 text-body-sm text-muted-foreground">{step.detail}</p>
                </div>
              </MotionStaggerItem>
            ))}
          </MotionStagger>
        </div>
      </section>

      {/* Example case */}
      <section className="border-b border-border/60 py-16 sm:py-24">
        <div className="container-wide">
          <MotionReveal>
            <p className="text-eyebrow text-accent">Example case</p>
            <h2 className="text-h2 mt-4 text-foreground">{data.exampleCase.title}</h2>
          </MotionReveal>

          <MotionReveal delay={0.1}>
            <div className="mt-10 max-w-3xl overflow-hidden rounded-xl border border-border">
              <div className="border-b border-border bg-secondary/50 px-6 py-4">
                <p className="text-body-sm font-semibold text-foreground">Input</p>
                <p className="mt-1 text-body-sm text-muted-foreground">{data.exampleCase.input}</p>
              </div>
              <div className="border-b border-border bg-destructive/5 px-6 py-4">
                <p className="text-body-sm font-semibold text-destructive">What went wrong</p>
                <p className="mt-1 text-body-sm text-muted-foreground">{data.exampleCase.failure}</p>
              </div>
              <div className="border-b border-border bg-emerald-500/5 px-6 py-4">
                <p className="text-body-sm font-semibold text-emerald-700">What Oreset caught</p>
                <p className="mt-1 text-body-sm text-muted-foreground">{data.exampleCase.caught}</p>
              </div>
              <div className="bg-background px-6 py-4">
                <p className="text-body-sm font-semibold text-foreground">Severity score</p>
                <p className="mt-1 text-body-sm text-muted-foreground">{data.exampleCase.severity}</p>
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      {/* Evidence / backing */}
      <section className="border-b border-border/60 bg-secondary/35 py-16 sm:py-24">
        <div className="container-wide">
          <MotionReveal>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-accent" />
              <p className="text-eyebrow text-accent">Why this matters</p>
            </div>
          </MotionReveal>

          <MotionStagger className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.evidence.map((e, i) => (
              <MotionStaggerItem key={i}>
                <div className="card-surface h-full p-6">
                  <p className="font-display text-2xl font-semibold text-foreground">{e.stat}</p>
                  <p className="mt-2 text-body-sm text-muted-foreground">{e.detail}</p>
                  <p className="mt-3 text-caption text-muted-foreground/70">{e.source}</p>
                </div>
              </MotionStaggerItem>
            ))}
          </MotionStagger>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="container-narrow text-center">
          <MotionReveal>
            <h2 className="text-h2 text-foreground">Ready to verify?</h2>
            <p className="mx-auto mt-4 max-w-lg text-body-lg text-muted-foreground">
              Send us a real case. We&apos;ll show you exactly what our reviewers catch.
            </p>
            <button
              type="button"
              onClick={() => openPilotModal()}
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-[0_10px_30px_rgba(197,106,50,0.25)] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-copper-600"
            >
              Request early access
              <ArrowRight className="size-4" />
            </button>
          </MotionReveal>
        </div>
      </section>
    </div>
    </>
  )
}
