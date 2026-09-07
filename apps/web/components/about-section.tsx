'use client'

import { MotionReveal, MotionStagger, MotionStaggerItem } from './motion-reveal'
import { MapPin, Target, Shield } from 'lucide-react'

const pillars = [
  {
    icon: Target,
    title: 'Decision-level testing',
    detail:
      "We don't just test if your AI can be broken. We test whether its decisions are correct, safe, and defensible under real-world conditions.",
  },
  {
    icon: Shield,
    title: 'Security and judgment in one engagement',
    detail:
      "Adversarial attacks, edge cases, multi-language inputs, and domain-specific scenarios. One team, one report, both dimensions covered.",
  },
  {
    icon: MapPin,
    title: 'Built in Abuja, testing globally',
    detail:
      "Headquartered in Nigeria. We test AI agents for companies anywhere, with particular depth in African languages and markets that no competitor covers.",
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
                The penetration test for AI decisions.
              </h2>
            </MotionReveal>
          </div>

          <div className="lg:col-span-7">
            <MotionReveal delay={0.08}>
              <p className="text-body-lg text-pretty text-muted-foreground">
                Oreset is an AI agent risk assessment service. Companies hand us access to
                their AI agent, and we stress-test it: can it be manipulated, does it
                make wrong decisions on its own, and what is the business consequence
                when it fails.
              </p>
              <p className="text-body mt-5 text-pretty text-muted-foreground">
                We exist because security testing stops at "can it be hacked" and monitoring
                starts after someone gets hurt. The gap between those two is where wrong
                decisions live. That gap is what Oreset closes.
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
