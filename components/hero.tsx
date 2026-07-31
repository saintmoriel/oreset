import Image from 'next/image'

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Copy */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-accent" />
              Now onboarding across 20+ African languages
            </span>

            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-display sm:text-5xl md:text-6xl">
              Get paid for your language. Help build African AI.
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Oreset is the network where African language experts contribute the data
              and evaluations that train and improve AI. Work in your own language, on
              your own schedule, and get paid fairly for it.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#apply"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5"
              >
                Apply to join
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                See how it works
              </a>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Free to join. No experience required beyond fluency in your language.
            </p>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative mx-auto aspect-square w-full max-w-md rounded-2xl border border-border bg-secondary p-8">
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex size-14 items-center justify-center overflow-hidden rounded-xl bg-[#f4efe6]">
                    <Image
                      src="/oreset-logo.png"
                      alt="Oreset"
                      width={56}
                      height={56}
                      className="size-14"
                      priority
                    />
                  </div>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                    Contributor
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-medium text-muted-foreground">This week</p>
                    <p className="mt-1 text-2xl font-semibold tracking-display">142 tasks</p>
                    <p className="text-xs text-muted-foreground">Yoruba · translation & review</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-xs font-medium text-muted-foreground">Quality</p>
                      <p className="mt-1 text-xl font-semibold tracking-display">98%</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-xs font-medium text-muted-foreground">Payout</p>
                      <p className="mt-1 text-xl font-semibold tracking-display">On time</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
