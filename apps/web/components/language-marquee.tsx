'use client'

import { motion, useReducedMotion } from 'framer-motion'

const languages = [
  { name: 'Yorùbá', script: 'Aa' },
  { name: 'Hausa', script: 'Aa' },
  { name: 'Igbo', script: 'Ịị' },
  { name: 'Kiswahili', script: 'Aa' },
  { name: 'Amharic', script: 'አማ' },
  { name: 'isiZulu', script: 'Aa' },
  { name: 'isiXhosa', script: 'Aa' },
  { name: 'Afaan Oromoo', script: 'Aa' },
  { name: 'Twi', script: 'Aa' },
  { name: 'Wolof', script: 'Aa' },
  { name: 'chiShona', script: 'Aa' },
  { name: 'Kinyarwanda', script: 'Aa' },
  { name: 'Soomaali', script: 'Aa' },
  { name: 'Lingála', script: 'Aa' },
  { name: 'Fulfulde', script: 'Aa' },
  { name: 'Bambara', script: 'Aa' },
  { name: 'Luganda', script: 'Aa' },
  { name: 'Tigrinya', script: 'ትግ' },
  { name: 'Sesotho', script: 'Aa' },
  { name: 'Chichewa', script: 'Aa' },
  { name: 'Kikuyu', script: 'Aa' },
  { name: 'Èʋegbe', script: 'Ɛɛ' },
]

function Chip({ name, script }: { name: string; script: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2.5 rounded-xl border border-border/80 bg-card px-3.5 py-2 shadow-[0_1px_2px_rgba(22,33,58,0.04)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-copper-200 hover:shadow-[0_6px_16px_rgba(22,33,58,0.06)]">
      <span
        className="flex size-7 items-center justify-center rounded-md bg-secondary font-display text-[11px] font-semibold text-accent"
        aria-hidden="true"
      >
        {script}
      </span>
      <span className="text-body-sm font-medium text-foreground">{name}</span>
    </span>
  )
}

export function LanguageMarquee() {
  const reduceMotion = useReducedMotion()
  const row = [...languages, ...languages]

  return (
    <section
      id="languages"
      aria-label="African languages Oreset supports"
      className="border-y border-border/60 bg-card/40 py-7 md:py-8"
    >
      <div className="container-wide mb-5 flex items-end justify-between gap-4">
        <p className="text-eyebrow text-muted-foreground">Coverage across the continent</p>
        <p className="text-caption text-muted-foreground">20+ languages · expanding monthly</p>
      </div>

      <div className="relative overflow-hidden mask-fade-x">
        {reduceMotion ? (
          <div className="flex flex-wrap justify-center gap-3 px-6">
            {languages.map((lang) => (
              <Chip key={lang.name} {...lang} />
            ))}
          </div>
        ) : (
          <motion.div
            className="marquee-track flex w-max items-center gap-3 pr-3"
            aria-hidden="true"
          >
            {row.map((lang, i) => (
              <Chip key={`${lang.name}-${i}`} {...lang} />
            ))}
          </motion.div>
        )}
      </div>

      <span className="sr-only">{languages.map((l) => l.name).join(', ')}</span>
    </section>
  )
}
