'use client'

import { MotionReveal, MotionStagger, MotionStaggerItem } from './motion-reveal'
import { MapPin, Target, Shield } from 'lucide-react'

const pillars = [
  {
    icon: Target,
    title: 'Decision-level verification',
    detail:
      'We don’t just check fluency. We check whether a language failure changed the outcome — a denied claim, a misjudged loan, a flagged transaction.',
  },
  {
    icon: Shield,
    title: 'Certified native reviewers',
    detail:
      'Every case is routed to a domain-matched, language-certified professional who passed calibration — not a crowdsourced annotator.',
  },
  {
    icon: MapPin,
    title: 'Built in Africa, for Africa',
    detail:
      'Headquartered in Abuja, Nigeria. Our reviewer network spans West, East, and North Africa — the regions where these decisions happen.',
  },
]

export function AboutSection() {
  return (
    <section id="about" className="border-t border-border/60 py-16 sm:py-24 md:py-32">
      <div className="container-wide">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <MotionReveal>
              <p className="text-eyebrow text-accent">About Oreset</p>
              <h2 className="text-h1 mt-4 text-balance text-foreground">
                Verification infrastructure for AI decisions in African languages.
              </h2>
            </MotionReveal>
          </div>

          <div className="lg:col-span-7">
            <MotionReveal delay={0.08}>
              <p className="text-body-lg text-pretty text-muted-foreground">
                Oreset is a verification layer that sits between AI systems and the high-stakes
                decisions they make in African languages. When an AI denies a claim, scores a loan,
                or triages a patient — and that decision flowed through Pidgin, Hausa, Yoruba,
                or Swahili — we verify whether the language was understood correctly and whether
                the outcome it produced is defensible.
              </p>
              <p className="text-body mt-5 text-pretty text-muted-foreground">
                We exist because fluency benchmarks don’t catch decision failures. A model can
                score well on translation and still deny a valid insurance claim because it
                misread a colloquial phrase. Oreset catches that gap — case by case,
                with evidence.
              </p>
            </MotionReveal>

            <MotionStagger className="mt-10 space-y-6">
              {pillars.map((pillar) => (
                <MotionStaggerItem key={pillar.title}>
                  <div className="flex gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <pillar.icon className="size-5 text-accent" />
                    </span>
                    <div>
                      <h3 className="text-body font-semibold text-foreground">{pillar.title}</h3>
                      <p className="text-body-sm mt-1 text-muted-foreground">{pillar.detail}</p>
                    </div>
                  </div>
                </MotionStaggerItem>
              ))}
            </MotionStagger>
          </div>
        </div>
      </div>
    </section>
  )
}
