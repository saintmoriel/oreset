import { Reveal } from './reveal'

const arms = [
  {
    index: 'A',
    tag: 'Data arm',
    name: 'Oreset Origin',
    description:
      'A distributed network of local collectors originates fresh African data — language, speech, and agricultural imagery — consented and licensed from the moment it is captured.',
    points: [
      'Collect-to-order delivery',
      'Consent built into every submission',
      'For AI labs, research teams, and agri-AI companies',
    ],
  },
  {
    index: 'B',
    tag: 'Talent arm',
    name: 'Oreset Operators',
    description:
      'Certified, native-language-fluent professionals review and correct AI output — catching what is culturally or linguistically wrong before it ever reaches real users.',
    points: [
      'Ongoing QA for live AI products',
      'AI drafts, but human judgment is final',
      'For companies whose AI already serves African markets',
    ],
  },
]

export function WhatWeBuild() {
  return (
    <section id="build" className="relative bg-ink py-24 text-ink-foreground md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Chapter header */}
        <div className="grid gap-10 border-b border-ink-border pb-14 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">02 — The network</p>
          </Reveal>
          <Reveal delay={120} className="md:col-span-9">
            <h2 className="max-w-[18ch] text-balance font-serif text-[clamp(2rem,5.2vw,3.75rem)] font-light leading-[1.04] tracking-tight">
              Two arms, drawing from <span className="italic text-accent">one</span> network.
            </h2>
          </Reveal>
        </div>

        {/* Arms */}
        <div>
          {arms.map((arm, i) => (
            <Reveal key={arm.name} delay={i * 140}>
              <article className="grid grid-cols-1 gap-8 border-b border-ink-border py-12 md:grid-cols-12 md:py-16">
                <div className="flex items-baseline gap-4 md:col-span-4">
                  <span className="font-serif text-5xl font-light leading-none text-ink-border md:text-6xl">
                    {arm.index}
                  </span>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{arm.tag}</p>
                    <h3 className="mt-2 font-serif text-3xl font-light tracking-tight md:text-4xl">{arm.name}</h3>
                  </div>
                </div>

                <p className="text-pretty text-lg leading-relaxed text-ink-foreground/70 md:col-span-5">
                  {arm.description}
                </p>

                <ul className="flex flex-col gap-3 md:col-span-3">
                  {arm.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 border-t border-ink-border pt-3 first:border-t-0 first:pt-0 md:border-t md:pt-3 md:first:border-t">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                      <span className="text-sm leading-relaxed text-ink-foreground/85">{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Converging statement */}
        <Reveal delay={120}>
          <p className="mt-16 max-w-4xl text-balance font-serif text-2xl font-light leading-snug tracking-tight md:text-4xl">
            The same network — verified and trusted —{' '}
            <span className="italic text-accent">feeds both</span>.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
