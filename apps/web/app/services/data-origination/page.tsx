'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Database, Globe, Mic, ShieldCheck } from 'lucide-react'
import { MotionReveal, MotionStagger, MotionStaggerItem } from '@/components/motion-reveal'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { SmoothScroll } from '@/components/smooth-scroll'
import { ScrollOrchestrator } from '@/components/scroll-orchestrator'

const capabilities = [
  {
    icon: Mic,
    title: 'Voice and text capture',
    detail:
      'Field collection of real-world language samples: voice notes, chat transcripts, form inputs, and spoken interactions in African languages and dialects.',
  },
  {
    icon: Globe,
    title: 'Multi-language coverage',
    detail:
      'Pidgin, Hausa, Yoruba, Swahili, Sheng, and dozens more. Native speakers collect and validate data in the language it naturally occurs.',
  },
  {
    icon: Database,
    title: 'Structured and consented',
    detail:
      'Every data point comes with digital consent, provenance tracking, and structured metadata. Ready for training, evaluation, or compliance.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality-gated delivery',
    detail:
      'Automated quality checks and reviewer sign-off before handoff. If a delivery falls below the agreed threshold, we re-collect at no additional cost.',
  },
]

export default function DataOriginationPage() {
  return (
    <>
      <SmoothScroll />
      <ScrollOrchestrator />
      <SiteNav />
      <main className="min-h-svh bg-background pt-24 sm:pt-28 md:pt-32">
        <div className="container-wide">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to home
          </Link>

          <MotionReveal className="mt-8">
            <p className="text-eyebrow text-accent">Service</p>
            <h1 className="text-h1 mt-4 max-w-3xl text-balance text-foreground">
              Data Origination
            </h1>
            <p className="text-body-lg mt-5 max-w-2xl text-pretty text-muted-foreground">
              When your AI model needs real-world language data from African markets,
              we source it directly from the field. Native speakers, real contexts,
              consented and structured.
            </p>
          </MotionReveal>

          <MotionStagger className="mt-16 grid gap-8 sm:grid-cols-2" staggerDelay={0.1}>
            {capabilities.map((cap) => (
              <MotionStaggerItem key={cap.title}>
                <div className="card-surface p-6">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
                    <cap.icon className="size-5 text-accent" />
                  </span>
                  <h3 className="text-h4 mt-4 text-foreground">{cap.title}</h3>
                  <p className="text-body-sm mt-2 text-muted-foreground">{cap.detail}</p>
                </div>
              </MotionStaggerItem>
            ))}
          </MotionStagger>

          <MotionReveal className="mt-16 border-t border-border/60 pt-12">
            <div className="max-w-2xl">
              <h2 className="text-h2 text-foreground">When you need this</h2>
              <ul className="mt-6 space-y-3 text-body text-muted-foreground">
                <li className="flex gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                  Your AI model underperforms on African languages and needs training data
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                  You need evaluation datasets in specific languages or dialects
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                  Compliance requires consented, traceable data provenance
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                  Your risk assessment revealed language-specific gaps that need ground-truth data to fix
                </li>
              </ul>
            </div>
          </MotionReveal>

          <MotionReveal className="mt-16 pb-20">
            <div className="card-surface bg-secondary/40 p-8 md:p-10">
              <h3 className="text-h3 text-foreground">Interested?</h3>
              <p className="mt-3 text-body text-muted-foreground">
                Data origination is available as a standalone service or bundled with a
                risk assessment engagement. Tell us what you need.
              </p>
              <a
                href="/#contact"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-body-sm font-semibold text-accent-foreground transition-colors hover:bg-copper-600"
              >
                Get in touch
                <ArrowRight className="size-4" />
              </a>
            </div>
          </MotionReveal>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
