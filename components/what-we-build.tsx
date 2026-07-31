import { Reveal } from './reveal'

const arms = [
  {
    tag: 'Data arm',
    name: 'Oreset Origin',
    description:
      'A distributed network of local collectors originates fresh African data — language, speech, and agricultural imagery — consented and licensed from the moment it\u2019s captured.',
    points: [
      'Collect-to-order delivery',
      'Consent built into every submission',
      'For AI labs, research teams, and agri-AI companies',
    ],
    dark: true,
  },
  {
    tag: 'Talent arm',
    name: 'Oreset Operators',
    description:
      'Certified, native-language-fluent professionals who review and correct AI output — catching what\u2019s culturally or linguistically wrong before it reaches real users.',
    points: [
      'Ongoing QA for live AI products',
      'AI drafts, but human judgment is final',
      'For companies whose AI already serves African markets',
    ],
    dark: false,
  },
]

export function WhatWeBuild() {
  return (
    <section id="build" className="relative border-t border-border/70 py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <p className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-accent">What we build</p>
          <h2 className="max-w-3xl text-balance font-serif text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-primary">
            Two arms, drawing from one network.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {arms.map((arm, i) => (
            <Reveal key={arm.name} delay={i * 160}>
              <article
                className={
                  arm.dark
                    ? 'flex h-full flex-col rounded-3xl bg-primary p-8 text-primary-foreground md:p-10'
                    : 'flex h-full flex-col rounded-3xl border border-border bg-card p-8 text-card-foreground md:p-10'
                }
              >
                <span
                  className={
                    arm.dark
                      ? 'text-sm font-medium uppercase tracking-[0.2em] text-accent'
                      : 'text-sm font-medium uppercase tracking-[0.2em] text-accent'
                  }
                >
                  {arm.tag}
                </span>
                <h3 className="mt-3 font-serif text-3xl font-semibold tracking-tight md:text-4xl">{arm.name}</h3>
                <p
                  className={
                    arm.dark
                      ? 'mt-5 text-pretty leading-relaxed text-primary-foreground/75'
                      : 'mt-5 text-pretty leading-relaxed text-muted-foreground'
                  }
                >
                  {arm.description}
                </p>
                <ul className="mt-8 flex flex-col gap-3 border-t border-current/15 pt-8">
                  {arm.points.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                      <span
                        className={
                          arm.dark ? 'leading-relaxed text-primary-foreground/90' : 'leading-relaxed text-foreground/90'
                        }
                      >
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mx-auto mt-16 max-w-3xl text-balance text-center font-serif text-2xl font-medium leading-snug text-primary md:text-3xl">
            Both arms, one origination engine — the same network, verified and trusted, feeding both.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
