import Image from 'next/image'

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Ambient logo mark bleeding off the right edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/2 hidden -translate-y-1/2 select-none md:block"
      >
        <div className="drift">
          <Image
            src="/oreset-logo.png"
            alt=""
            width={620}
            height={620}
            className="h-[560px] w-[560px] opacity-[0.10] lg:h-[680px] lg:w-[680px]"
            priority
          />
        </div>
      </div>

      {/* Copper arc echoing the logo's circle element */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-40 h-[420px] w-[420px] rounded-full bg-accent/15 md:h-[560px] md:w-[560px]"
      />

      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-5 pb-20 pt-32 md:px-8 md:pt-40">
        <p
          className="reveal is-visible mb-8 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-accent"
          style={{ animationDelay: '80ms' }}
        >
          <span className="h-px w-10 bg-accent" aria-hidden="true" />
          African AI infrastructure
        </p>

        <h1
          className="reveal is-visible font-serif text-[clamp(3.5rem,14vw,11rem)] font-semibold leading-[0.86] tracking-tight text-primary"
          style={{ animationDelay: '160ms' }}
        >
          ORESET
        </h1>

        <p
          className="reveal is-visible mt-10 max-w-2xl text-pretty text-lg leading-relaxed text-foreground/80 md:text-xl"
          style={{ animationDelay: '320ms' }}
        >
          A data-and-talent origination network for African AI. We source consented African data and certify
          native-language AI operators who help build, verify, and localize AI systems for the continent.
        </p>

        <div
          className="reveal is-visible mt-12 flex flex-col gap-3 sm:flex-row sm:items-center"
          style={{ animationDelay: '460ms' }}
        >
          <a
            href="#contact"
            className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 text-base font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Get in touch
          </a>
          <a
            href="#build"
            className="inline-flex items-center justify-center rounded-full border border-primary/25 px-7 py-3.5 text-base font-medium text-primary transition-colors hover:border-primary/60"
          >
            See what we build
          </a>
        </div>
      </div>
    </section>
  )
}
