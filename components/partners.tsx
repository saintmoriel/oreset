import { Reveal } from './reveal'

export function Partners() {
  return (
    <section id="partners" className="border-y border-border bg-secondary py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-eyebrow text-accent">
              For AI teams
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-display sm:text-4xl">
              High-quality African language data, from real native speakers.
            </h2>
            <p className="mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              Building or evaluating models for African markets? Access consented,
              expert-verified data and human evaluation across a growing set of
              languages — sourced ethically and delivered to your specification.
            </p>
            <a
              href="#apply"
              className="mt-8 inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-background"
            >
              Talk to our team
            </a>
          </Reveal>

          <Reveal delay={120}>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border">
              {[
                ['Native fluency', 'Every contributor verified'],
                ['Consent-first', 'Ethically sourced data'],
                ['Human evaluation', 'Cultural accuracy, not just grammar'],
                ['Your spec', 'Data collected to order'],
              ].map(([term, desc]) => (
                <div key={term} className="bg-card p-6">
                  <dt className="text-sm font-semibold tracking-display">{term}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
