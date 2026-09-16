'use client'

import Link from 'next/link'
import { ArrowLeft, KeyRound, Database, Users, FileText, Megaphone } from 'lucide-react'
import { MotionReveal, MotionStagger, MotionStaggerItem } from '@/components/motion-reveal'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { SmoothScroll } from '@/components/smooth-scroll'
import { ScrollOrchestrator } from '@/components/scroll-orchestrator'

// Plain statements only. No badges we do not hold.

const SECTIONS = [
  {
    icon: KeyRound,
    title: 'Access',
    points: [
      'We test against a staging or sandbox environment wherever one exists. Production testing happens only with written agreement on scope, hours, and kill switch.',
      'Credentials are scoped to the engagement and issued by you. You can revoke them at any moment without telling us first.',
      'We never test outside the agreed scope. If we find a path into something out of scope, we stop and tell you.',
    ],
  },
  {
    icon: Database,
    title: 'Your data',
    points: [
      'Attack prompts, agent responses, and tool call logs from your engagement are used for your engagement. They are not used to train models, ours or anyone else’s.',
      'Findings are visible to your account and to Oreset staff working the engagement. Nothing is shared with other clients, published, or used as a reference without your written consent.',
      'Engagement data is retained for the engagement plus the retest window, then deleted on request. Regression exports you download are yours.',
    ],
  },
  {
    icon: Users,
    title: 'Our people',
    points: [
      'Every tester signs a non-disclosure agreement, a code of conduct, and a data handling policy before they see a single scenario. Signatures are recorded with time and IP.',
      'Testers pass calibration against scenarios with known correct answers before working a live engagement, and their accuracy is tracked continuously.',
      'Testers see the scenario, not your business. Client identity is limited to what the scenario needs.',
    ],
  },
  {
    icon: FileText,
    title: 'Reporting',
    points: [
      'Every finding carries reproduction steps so your engineers can confirm it independently. We do not ask you to take our word for it.',
      'Every critical and high finding is reproduced by a lead auditor before it appears in your dashboard. False positives are recorded and never shown to you.',
      'An audit log records who saw what and when, across testers, auditors, and staff.',
    ],
  },
  {
    icon: Megaphone,
    title: 'Disclosure',
    points: [
      'We do not disclose findings publicly. Ever. Case studies happen only with your approval of every word.',
      'If we discover a vulnerability in a third-party model or platform during your engagement, we coordinate disclosure with you before contacting the vendor.',
    ],
  },
]

export default function TrustPage() {
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
            <p className="text-eyebrow text-accent">Trust</p>
            <h1 className="text-h1 mt-4 max-w-3xl text-balance text-foreground">
              You are handing us the keys to something that moves money. Here is what we do with them.
            </h1>
            <p className="text-body-lg mt-5 max-w-2xl text-pretty text-muted-foreground">
              No badges on this page. We do not currently hold SOC 2 or ISO 27001 certification, and
              we will say so until we do. What follows is what we actually practise, in plain language,
              and every line of it is something you can hold us to in the engagement agreement.
            </p>
          </MotionReveal>

          <MotionStagger className="mt-14 space-y-6" stagger={0.08}>
            {SECTIONS.map((s) => (
              <MotionStaggerItem key={s.title}>
                <div className="card-surface grid gap-6 p-6 lg:grid-cols-12">
                  <div className="flex items-start gap-3 lg:col-span-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <s.icon className="size-5 text-accent" />
                    </span>
                    <h2 className="text-h3 text-foreground">{s.title}</h2>
                  </div>
                  <ul className="space-y-3 lg:col-span-9">
                    {s.points.map((p) => (
                      <li key={p} className="text-body text-pretty text-foreground/85">{p}</li>
                    ))}
                  </ul>
                </div>
              </MotionStaggerItem>
            ))}
          </MotionStagger>

          <MotionReveal className="mt-16 border-t border-border/60 py-12">
            <p className="text-body max-w-2xl text-muted-foreground">
              Questions about any of this, or requirements we have not covered, go to{' '}
              <a href="mailto:security@oreset.africa" className="font-semibold text-accent hover:text-copper-600">security@oreset.africa</a>.
              A person reads it.
            </p>
          </MotionReveal>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
