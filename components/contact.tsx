import Image from 'next/image'
import { Reveal } from './reveal'

const EMAIL = 'hello@oreset.ai'

export function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden border-t border-border/70 py-24 md:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent/10"
      />
      <div className="relative mx-auto max-w-4xl px-5 text-center md:px-8">
        <Reveal>
          <Image
            src="/oreset-logo.png"
            alt="Oreset logo"
            width={64}
            height={64}
            className="mx-auto mb-8 h-16 w-16"
          />
          <h2 className="text-balance font-serif text-[clamp(2.25rem,6vw,4rem)] font-semibold leading-[1.02] tracking-tight text-primary">
            Building for African AI? Let&apos;s talk.
          </h2>
          <a
            href={`mailto:${EMAIL}`}
            className="mt-10 inline-flex items-center justify-center rounded-full bg-accent px-8 py-4 text-base font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            {EMAIL}
          </a>
        </Reveal>
      </div>
    </section>
  )
}
