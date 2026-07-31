import Image from 'next/image'

const specs = [
  { k: 'Data arm', v: 'Oreset Origin' },
  { k: 'Talent arm', v: 'Oreset Operators' },
  { k: 'Coverage', v: '2,000+ languages' },
]

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-ink text-ink-foreground">
      {/* Right specimen panel (paper) — deliberate two-tone split */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 z-10 hidden h-full w-[38%] flex-col justify-center bg-paper md:flex lg:w-[40%]"
      >
        <div className="drift flex justify-center">
          <Image
            src="/oreset-logo.png"
            alt=""
            width={640}
            height={640}
            priority
            className="h-[300px] w-[300px] lg:h-[380px] lg:w-[380px]"
          />
        </div>
        <p className="absolute bottom-6 left-8 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
          Fig. 001 — The Oreset mark
        </p>
      </div>

      {/* Content column */}
      <div className="relative z-20 mx-auto max-w-7xl px-5 pb-10 pt-28 md:px-8 md:pt-32">
        <div className="md:pr-[42%] lg:pr-[44%]">
          {/* Top metadata line */}
          <div
            className="intro flex items-center justify-between gap-4 border-b border-ink-border pb-5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink-muted"
            style={{ animationDelay: '80ms' }}
          >
            <span>Origination network</span>
            <span>Index / 001</span>
          </div>

          {/* Headline block */}
          <div className="flex min-h-[calc(100svh-14rem)] flex-col justify-center py-14">
            <p
              className="intro mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-accent"
              style={{ animationDelay: '200ms' }}
            >
              <span className="h-px w-8 bg-accent" aria-hidden="true" />
              African AI infrastructure
            </p>

            <h1 className="text-balance font-serif text-[clamp(2.5rem,6.5vw,5.5rem)] font-light leading-[0.96] tracking-tight">
              <span className="intro block" style={{ animationDelay: '280ms' }}>
                The raw material
              </span>
              <span className="intro block" style={{ animationDelay: '400ms' }}>
                for African AI —
              </span>
              <span className="intro block italic text-accent" style={{ animationDelay: '520ms' }}>
                originated, not scraped.
              </span>
            </h1>

            <p
              className="intro mt-9 max-w-xl text-pretty text-lg leading-relaxed text-ink-foreground/70"
              style={{ animationDelay: '660ms' }}
            >
              We source consented African data and certify native-language operators who build, verify, and localize
              AI systems for the continent — one trusted origination engine feeding both.
            </p>

            <div
              className="intro mt-11 flex flex-col gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: '800ms' }}
            >
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 text-base font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                Get in touch
              </a>
              <a
                href="#build"
                className="inline-flex items-center justify-center rounded-full border border-ink-border px-7 py-3.5 text-base font-medium text-ink-foreground transition-colors hover:border-ink-foreground/60"
              >
                Explore the network
              </a>
            </div>
          </div>

          {/* Bottom spec row */}
          <dl
            className="intro grid grid-cols-1 gap-px border-t border-ink-border sm:grid-cols-3"
            style={{ animationDelay: '920ms' }}
          >
            {specs.map((spec) => (
              <div
                key={spec.k}
                className="flex items-baseline justify-between gap-4 py-5 sm:flex-col sm:items-start sm:gap-2 sm:pr-6"
              >
                <dt className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink-muted">{spec.k}</dt>
                <dd className="font-serif text-lg tracking-tight text-ink-foreground md:text-xl">{spec.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
