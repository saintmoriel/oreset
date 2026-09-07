'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Languages, Scale, Shield, Users } from 'lucide-react'
import { MotionReveal, MotionStagger, MotionStaggerItem } from '@/components/motion-reveal'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { SmoothScroll } from '@/components/smooth-scroll'
import { ScrollOrchestrator } from '@/components/scroll-orchestrator'

const capabilities = [
  {
    icon: Languages,
    title: 'African language coverage',
    detail:
      'Pidgin, Hausa, Yoruba, Igbo, Swahili, Sheng, Amharic, and more. We test in the languages your users actually speak, including code-switching and informal speech.',
  },
  {
    icon: Scale,
    title: 'Decision verification',
    detail:
      'Did the AI correctly understand what the user said in their language, and was the resulting decision actually correct? We check both independently.',
  },
  {
    icon: Users,
    title: 'Native-speaker reviewers',
    detail:
      'Every case is reviewed by certified testers who are native speakers of the language involved and understand the domain context.',
  },
  {
    icon: Shield,
    title: 'Compliance-ready reporting',
    detail:
      'Structured reports with error taxonomy, severity scoring, and audit trails. Built for teams that need to demonstrate fairness across language groups.',
  },
]

const languages = [
  'Nigerian Pidgin', 'Hausa', 'Yoruba', 'Igbo', 'Swahili',
  'Sheng', 'Amharic', 'Twi', 'Zulu', 'Wolof',
]

export default function AfricanAiAssurancePage() {
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
              African AI Decision Assurance
            </h1>
            <p className="text-body-lg mt-5 max-w-2xl text-pretty text-muted-foreground">
              AI systems serving African markets make decisions based on languages they
              barely understand. We verify that the AI got it right — in the language
              the user actually spoke.
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
              <h2 className="text-h2 text-foreground">Languages we cover</h2>
              <p className="mt-3 text-body text-muted-foreground">
                We test in the languages your African users actually speak. Coverage is
                scoped per engagement — we start from what you bring us.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <span
                    key={lang}
                    className="rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-body-sm font-medium text-foreground"
                  >
                    {lang}
                  </span>
                ))}
                <span className="rounded-full border border-accent/30 bg-accent/5 px-3 py-1.5 text-body-sm font-medium text-accent">
                  + more on request
                </span>
              </div>
            </div>
          </MotionReveal>

          <MotionReveal className="mt-16 border-t border-border/60 pt-12">
            <div className="max-w-2xl">
              <h2 className="text-h2 text-foreground">When you need this</h2>
              <ul className="mt-6 space-y-3 text-body text-muted-foreground">
                <li className="flex gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                  Your AI product serves users who speak African languages
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                  Claims, loans, or support decisions are being made on language inputs your model was not trained for
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                  You need to demonstrate fairness and accuracy across language groups for compliance
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                  A risk assessment revealed language-specific failures you need to validate and track
                </li>
              </ul>
            </div>
          </MotionReveal>

          <MotionReveal className="mt-16 pb-20">
            <div className="card-surface bg-secondary/40 p-8 md:p-10">
              <h3 className="text-h3 text-foreground">Interested?</h3>
              <p className="mt-3 text-body text-muted-foreground">
                African AI decision assurance is available as a standalone service or as
                a specialized dimension within a broader risk assessment. Tell us what
                your AI handles and which languages are involved.
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
