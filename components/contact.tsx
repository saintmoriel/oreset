import { Reveal } from './reveal'

export function Contact() {
  return (
    <section id="apply" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="rounded-3xl border border-border bg-secondary px-6 py-14 text-center md:px-16 md:py-20">
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-display sm:text-4xl md:text-5xl">
              Your language belongs in the future of AI.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Join a growing network of African language experts getting paid to build
              AI that finally understands the continent.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="mailto:hello@oreset.com?subject=Join%20the%20Oreset%20network"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5"
              >
                Apply to join
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-background"
              >
                Learn more first
              </a>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Questions? Email us at{' '}
              <a href="mailto:hello@oreset.com" className="font-medium text-accent underline-offset-4 hover:underline">
                hello@oreset.com
              </a>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
