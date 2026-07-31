import { Reveal } from './reveal'

const benefits = [
  {
    title: 'Fair, transparent pay',
    body: 'Clear rates before you start a task and reliable payouts in a method that works for you. You always know what you will earn.',
  },
  {
    title: 'Work on your terms',
    body: 'No shifts, no quotas. Contribute for ten minutes or ten hours — from your phone or laptop, wherever you are.',
  },
  {
    title: 'Your language, respected',
    body: 'Your fluency is the expertise. We treat contributors as specialists, not anonymous crowd labor.',
  },
  {
    title: 'Grow with the network',
    body: 'Build a track record, unlock higher-value work, and take on review and mentoring roles as you go.',
  },
]

export function WhatWeBuild() {
  return (
    <section id="why" className="bg-primary py-20 text-primary-foreground md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-eyebrow text-accent">
            Why Oreset
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-display sm:text-4xl">
            Built to respect the people behind the data.
          </h2>
          <p className="mt-5 text-pretty leading-relaxed text-primary-foreground/70">
            Most language data is scraped without consent or credit. Oreset is the
            opposite: real people, fairly paid, doing work they can be proud of.
          </p>
        </div>

        <div className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {benefits.map((benefit, i) => (
            <Reveal key={benefit.title} delay={i * 80}>
              <div className="border-t border-white/15 pt-6">
                <h3 className="text-xl font-semibold tracking-display">{benefit.title}</h3>
                <p className="mt-3 text-pretty leading-relaxed text-primary-foreground/70">
                  {benefit.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
