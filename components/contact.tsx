import Image from 'next/image'
import { Reveal } from './reveal'

const EMAIL = 'hello@oreset.ai'

export function Contact() {
  return (
    <section id="contact" className="relative bg-background py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">03 — Contact</p>
          </Reveal>

          <div className="md:col-span-9">
            <Reveal>
              <Image src="/oreset-logo.png" alt="Oreset logo" width={56} height={56} className="mb-8 h-14 w-14" />
              <h2 className="max-w-[16ch] text-balance font-serif text-[clamp(2.25rem,6vw,4.5rem)] font-light leading-[1] tracking-tight text-foreground">
                Building for African AI? <span className="italic text-accent">Let&apos;s talk.</span>
              </h2>
            </Reveal>

            <Reveal delay={140}>
              <div className="mt-12 flex flex-col gap-6 border-t border-border pt-10 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-pretty leading-relaxed text-muted-foreground">
                  Tell us what you&apos;re building. We&apos;ll show you the data and the operators that make it work
                  on the continent.
                </p>
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-full bg-accent px-8 py-4 text-base font-medium text-accent-foreground transition-opacity hover:opacity-90"
                >
                  {EMAIL}
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
