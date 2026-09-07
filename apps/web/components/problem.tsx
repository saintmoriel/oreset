'use client'

import { MotionReveal } from './motion-reveal'
import { ScrollWords } from './scroll-words'
import { SiteImage } from './site-image'

const PROBLEM_IMAGE = '/pipeline-oreset.jpeg'

const INCIDENTS = [
  {
    name: 'Air Canada chatbot',
    detail: 'Promised a refund policy that did not exist. Company lost a tribunal ruling.',
  },
  {
    name: 'NYC city chatbot',
    detail: 'Gave illegal business advice to residents. Front-page story.',
  },
  {
    name: 'GPT-5.6',
    detail: 'Deleted user files during a routine task. Trust collapsed overnight.',
  },
]

export function Problem() {
  return (
    <section
      id="problem"
      data-scroll-section
      className="relative py-16 sm:py-24 md:py-32 lg:py-36"
    >
      <div className="container-wide">
        <div className="grid items-start gap-10 sm:gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <MotionReveal>
              <p className="text-eyebrow text-accent">The problem</p>
            </MotionReveal>

            <MotionReveal delay={0.08}>
              <h2 className="text-h1 mt-4 text-balance text-foreground sm:mt-5">
                AI agents ship fast. Nobody tests whether they decide&nbsp;right.
              </h2>
            </MotionReveal>

            <MotionReveal delay={0.14}>
              <p className="text-body-lg mt-5 max-w-2xl text-pretty text-muted-foreground sm:mt-6">
                Security firms test if your AI can be hacked. Monitoring tools watch it
                after launch. But nobody tests the gap in between: does your AI agent make
                wrong decisions on its own, before a single user touches it?
              </p>
            </MotionReveal>

            <MotionReveal delay={0.18}>
              <div className="mt-8 grid gap-6 sm:mt-10 sm:grid-cols-2">
                <div className="border-t border-border pt-5">
                  <div
                    data-scroll-line
                    className="mb-5 h-0.5 w-12 origin-left bg-accent"
                    aria-hidden="true"
                  />
                  <p className="text-h4 text-foreground">Security testing stops too early</p>
                  <p className="text-body-sm mt-2 text-muted-foreground">
                    Pen testers check if the agent can be jailbroken or tricked into leaking
                    data. They don't check if it gives wrong advice, takes irreversible
                    actions, or falls apart on edge cases.
                  </p>
                </div>
                <div className="border-t border-border pt-5">
                  <div
                    data-scroll-line
                    className="mb-5 h-0.5 w-12 origin-left bg-accent"
                    aria-hidden="true"
                  />
                  <p className="text-h4 text-foreground">Monitoring starts too late</p>
                  <p className="text-body-sm mt-2 text-muted-foreground">
                    Production monitoring tells you something went wrong after a user was
                    affected. By then, the damage is done: a bad decision, a headline, a
                    lawsuit.
                  </p>
                </div>
              </div>
            </MotionReveal>
          </div>

          <MotionReveal delay={0.12} className="lg:col-span-5 lg:pt-6">
            <div className="card-surface overflow-hidden">
              <div className="border-b border-border/60 px-5 py-3">
                <p className="text-eyebrow text-destructive">Real incidents</p>
              </div>
              <div className="divide-y divide-border/60">
                {INCIDENTS.map((inc) => (
                  <div key={inc.name} className="px-5 py-4">
                    <p className="text-h4 text-foreground">{inc.name}</p>
                    <p className="text-body-sm mt-1 text-muted-foreground">{inc.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </MotionReveal>
        </div>

        <div className="relative mt-12 max-w-4xl sm:mt-16 md:mt-20">
          <div
            data-scroll-line
            className="absolute -left-1 top-0 h-full w-1 origin-top rounded-full bg-accent md:-left-2"
            aria-hidden="true"
          />
          <ScrollWords
            className="pl-5 font-display text-xl font-semibold leading-snug tracking-tight text-foreground sm:pl-6 sm:text-2xl md:pl-8 md:text-[2rem] md:leading-[1.25]"
            text="Every AI agent makes decisions. Oreset tests whether those decisions are right, before they cost you something."
          />
          <p className="mt-4 pl-5 text-body-sm text-muted-foreground sm:pl-6 md:pl-8">
            Oreset operating thesis
          </p>
        </div>
      </div>
    </section>
  )
}
