import { Reveal } from './reveal'

const stats = [
  {
    value: '74%',
    label:
      'of organizations that deployed a live AI customer-service agent have had to roll it back after real-world failures.',
  },
  {
    value: '2,000+',
    label: 'living languages are spoken across Africa — nearly none meaningfully represented in major AI models.',
  },
  {
    value: '×6',
    label: 'unrelated meanings a single Yoruba word can carry once its diacritics are stripped away.',
  },
]

export function Problem() {
  return (
    <section id="problem" className="relative bg-background py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Chapter header */}
        <div className="grid gap-10 border-b border-border pb-14 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">01 — The problem</p>
          </Reveal>
          <Reveal delay={120} className="md:col-span-9">
            <h2 className="max-w-[20ch] text-balance font-serif text-[clamp(2rem,5.2vw,3.75rem)] font-light leading-[1.04] tracking-tight text-foreground">
              Africa&apos;s languages and land are still{' '}
              <span className="italic text-accent">invisible</span> to the AI shaping the next decade.
            </h2>
          </Reveal>
        </div>

        {/* Data rows */}
        <div className="mt-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.value} delay={i * 120}>
              <div className="grid grid-cols-1 items-start gap-4 border-b border-border py-10 md:grid-cols-12 md:gap-8 md:py-12">
                <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground md:col-span-1 md:pt-4">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-serif text-6xl font-light leading-none tracking-tight text-foreground md:col-span-4 md:text-7xl">
                  {stat.value}
                </span>
                <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground md:col-span-7 md:pt-3">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
