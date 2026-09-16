'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { MotionReveal, MotionStagger, MotionStaggerItem } from '@/components/motion-reveal'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { SmoothScroll } from '@/components/smooth-scroll'
import { ScrollOrchestrator } from '@/components/scroll-orchestrator'
import { openPilotModal } from '@/components/pilot-scoping-modal'

const INCLUDED_EVERYWHERE = [
  'Human red team, no SDK or integration required',
  'Every P0 and P1 finding reproduced by a lead auditor before you see it',
  'Live findings dashboard with resilience score',
  'Reproduction steps and a recommended fix on every finding',
  'Free retest of every fix, finding closes only when the attack no longer lands',
  'Regression suite export (JSON and JSONL) for your CI pipeline',
  'Webhooks for your own tooling',
]

const TIERS = [
  {
    name: 'Rapid Agent Pentest',
    price: 'From $3,500',
    cadence: 'One engagement',
    who: 'One AI agent, one clear surface. Pre-launch or post-update.',
    scope: [
      'Up to 2 agent endpoints or flows',
      'Security and judgement scenarios',
      'Roughly 1 week from kickoff to readout',
      'Retest window: 30 days',
    ],
    cta: 'Request early access',
    featured: false,
  },
  {
    name: 'Comprehensive Red Team',
    price: 'From $6,500',
    cadence: 'One engagement',
    who: 'An agent with tools, money, or customer data behind it. Multiple flows, multiple languages.',
    scope: [
      'Up to 5 agent endpoints or flows',
      'Security, judgement, and business impact assessment',
      'Dual-solve on high-stakes scenarios',
      'Roughly 2 weeks from kickoff to readout',
      'Retest window: 60 days',
    ],
    cta: 'Request early access',
    featured: true,
  },
  {
    name: 'Continuous',
    price: 'From $1,500 / month',
    cadence: 'Retainer',
    who: 'You ship agent changes often and want every release tested against the attacks that already worked.',
    scope: [
      'Monthly scenario refresh against your live agent',
      'Retest of every closed finding on every release',
      'Standing dashboard and regression suite',
      'Priority queue for new findings',
    ],
    cta: 'Talk to us',
    featured: false,
  },
]

export default function PricingPage() {
  return (
    <>
      <SmoothScroll />
      <ScrollOrchestrator />
      <SiteNav />
      <main className="min-h-svh bg-background pt-24 sm:pt-28 md:pt-32">
        <div className="container-wide">
          <Link href="/" className="inline-flex items-center gap-1.5 text-body-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-3.5" />
            Back to home
          </Link>

          <MotionReveal className="mt-8">
            <p className="text-eyebrow text-accent">Pricing</p>
            <h1 className="text-h1 mt-4 max-w-3xl text-balance text-foreground">
              Priced like a pentest. Delivered like a platform.
            </h1>
            <p className="text-body-lg mt-5 max-w-2xl text-pretty text-muted-foreground">
              Starting points, not quotes. Every engagement is scoped first, and the scope sets
              the price. Nothing below is a subscription to a tool. It is a human red team with
              a dashboard attached.
            </p>
          </MotionReveal>

          <MotionStagger className="mt-14 grid gap-6 lg:grid-cols-3" stagger={0.1}>
            {TIERS.map((t) => (
              <MotionStaggerItem key={t.name}>
                <div className={`card-surface flex h-full flex-col p-6 ${t.featured ? 'border-accent ring-1 ring-accent/40' : ''}`}>
                  <p className="text-eyebrow text-muted-foreground">{t.cadence}</p>
                  <h2 className="text-h3 mt-2 text-foreground">{t.name}</h2>
                  <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">{t.price}</p>
                  <p className="text-body-sm mt-3 text-muted-foreground">{t.who}</p>
                  <ul className="mt-5 space-y-2">
                    {t.scope.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-body-sm text-foreground/85">
                        <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                        {s}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => openPilotModal()}
                    className={`mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold transition-colors ${
                      t.featured
                        ? 'bg-accent text-accent-foreground hover:bg-copper-600'
                        : 'border border-border bg-card text-foreground hover:border-accent/50'
                    }`}
                  >
                    {t.cta}
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </MotionStaggerItem>
            ))}
          </MotionStagger>

          <MotionReveal className="mt-16 grid gap-10 border-t border-border/60 pt-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="text-h2 text-foreground">Included in every tier</h2>
              <p className="text-body mt-3 text-muted-foreground">
                Retesting is not an add-on. A finding you cannot verify as fixed is not a finding you can act on.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-8">
              {INCLUDED_EVERYWHERE.map((s) => (
                <li key={s} className="flex items-start gap-2 text-body-sm text-foreground/85">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                  {s}
                </li>
              ))}
            </ul>
          </MotionReveal>

          <MotionReveal className="mt-16 border-t border-border/60 py-12">
            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <p className="text-h4 text-foreground">Why publish prices?</p>
                <p className="text-body-sm mt-2 text-muted-foreground">Because you should know whether this is a conversation worth having before you have it.</p>
              </div>
              <div>
                <p className="text-h4 text-foreground">What moves the price?</p>
                <p className="text-body-sm mt-2 text-muted-foreground">Number of agent flows, tools the agent can call, languages in scope, and whether high-stakes scenarios need two independent testers.</p>
              </div>
              <div>
                <p className="text-h4 text-foreground">Early partners</p>
                <p className="text-body-sm mt-2 text-muted-foreground">We are onboarding a small number of early partners at reduced rates in exchange for a reference. Ask.</p>
              </div>
            </div>
          </MotionReveal>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
