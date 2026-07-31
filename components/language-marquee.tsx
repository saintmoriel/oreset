const languages = [
  'Yorùbá',
  'Hausa',
  'Igbo',
  'Kiswahili',
  'Amharic',
  'isiZulu',
  'isiXhosa',
  'Afaan Oromoo',
  'Twi',
  'Wolof',
  'chiShona',
  'Kinyarwanda',
  'Soomaali',
  'Lingála',
  'Fulfulde',
  'Bambara',
  'Luganda',
  'Tigrinya',
  'Sesotho',
  'Chichewa',
  'Kikuyu',
  'Èʋegbe',
]

export function LanguageMarquee() {
  return (
    <section
      aria-label="A sample of African languages Oreset originates data for"
      className="border-y border-ink-border bg-ink py-6 text-ink-foreground"
    >
      <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="marquee-track flex shrink-0 items-center gap-8 pr-8">
          {[...languages, ...languages].map((lang, i) => (
            <span key={i} className="flex shrink-0 items-center gap-8">
              <span className="font-serif text-xl tracking-tight text-ink-foreground/80 md:text-2xl">{lang}</span>
              <span className="h-1 w-1 rounded-full bg-accent" aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
