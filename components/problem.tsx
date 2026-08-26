'use client'

import { MotionReveal } from './motion-reveal'
import { ScrollWords } from './scroll-words'
import { SiteImage } from './site-image'

const PROBLEM_IMAGE =
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'

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
                Fluency gets tested. Consequence &nbsp;doesn't.
              </h2>
            </MotionReveal>

            <MotionReveal delay={0.14}>
              <p className="text-body-lg mt-5 max-w-2xl text-pretty text-muted-foreground sm:mt-6">
                Real benchmarks test whether an AI is fluent in a language. Almost none test
                whether a language failure changed the decision that followed — a claim, a loan,
                a transaction.
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
                  <p className="text-h4 text-foreground">The Consequence Gap</p>
                  <p className="text-body-sm mt-2 text-muted-foreground">
                    A model can sound fluent in Yoruba, Hausa, or Pidgin and still get the
                    decision wrong. Nothing in standard evaluation checks for that difference.
                  </p>
                </div>
                <div className="border-t border-border pt-5">
                  <div
                    data-scroll-line
                    className="mb-5 h-0.5 w-12 origin-left bg-accent"
                    aria-hidden="true"
                  />
                  <p className="text-h4 text-foreground">Unverified Talent QA</p>
                  <p className="text-body-sm mt-2 text-muted-foreground">
                    Without certification and scorecards, 
                    buyers cannot trust that a language-driven decision was actually correct
                     — and experts get treated as disposable gig labor, not professionals.
                  </p>
                </div>
              </div>
            </MotionReveal>
          </div>

          <MotionReveal delay={0.12} className="lg:col-span-5 lg:pt-6">
            <figure className="card-surface overflow-hidden">
              <div className="photo-brand relative aspect-[4/3] overflow-hidden sm:aspect-square lg:aspect-[4/5]">
                <SiteImage
                  data-scroll-media
                  src={PROBLEM_IMAGE}
                  alt="Abstract view of Earth from orbit, illustrating the gap between global systems and underrepresented languages"
                  fill
                  className="will-change-transform"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
              <figcaption className="border-t border-border/60 px-4 py-3 text-caption text-muted-foreground">
                Representation is a pipeline problem, not a prompt problem.
              </figcaption>
            </figure>
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
            text="Fluency is not the same as correct. Oreset verifies the difference, before it costs someone something."
          />
          <p className="mt-4 pl-5 text-body-sm text-muted-foreground sm:pl-6 md:pl-8">
            Oreset operating thesis
          </p>
        </div>
      </div>
    </section>
  )
}