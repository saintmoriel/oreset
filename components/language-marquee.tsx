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
      aria-label="A sample of African languages Oreset supports"
      className="border-y border-border/60 py-6"
    >
      <div className="relative flex overflow-hidden mask-fade-x">
        <div className="marquee-track flex shrink-0 items-center gap-10 pr-10">
          {[...languages, ...languages].map((lang, i) => (
            <span key={i} className="flex shrink-0 items-center gap-10">
              <span className="text-base font-medium tracking-wide text-muted-foreground md:text-lg">{lang}</span>
              <span className="size-1 rounded-full bg-accent/40" aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
