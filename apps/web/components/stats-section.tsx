'use client'

import { AnimatedCounter } from './animated-counter'
import { MotionReveal } from './motion-reveal'

const stats = [
  { target: 20, suffix: '+', label: 'African Languages' },
  { target: 500, suffix: '+', label: 'Certified Operators' },
  { target: 10, suffix: 'M+', label: 'Data Points Sourced' },
  { target: 50, suffix: '+', label: 'Clients' },
]

export function StatsSection() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Top divider */}
        <div className="divider-thin mb-16 md:mb-20" />

        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-6">
          {stats.map((stat, i) => (
            <MotionReveal key={stat.label} delay={i * 0.1}>
              <div className="text-center md:text-left">
                <p className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                  <AnimatedCounter
                    target={stat.target}
                    suffix={stat.suffix}
                    duration={2.2}
                  />
                </p>
                <p className="mt-3 text-sm font-medium text-muted-foreground md:text-base">
                  {stat.label}
                </p>
              </div>
            </MotionReveal>
          ))}
        </div>

        {/* Bottom divider */}
        <div className="divider-thin mt-16 md:mt-20" />
      </div>
    </section>
  )
}
