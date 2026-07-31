import { Reveal } from './reveal'

const stats = [
  {
    value: '74%',
    label:
      'of organizations that deployed a live AI customer-service agent have had to roll it back due to real failures.',
  },
  {
    value: '2,000+',
    label: 'living languages spoken across Africa, nearly none meaningfully represented in major AI models.',
  },
  {
    value: '6',
    label: 'unrelated meanings a single un-diacriticized Yoruba word can carry.',
  },
]

export function Problem() {
  return (
    <section id="problem" className="relative border-t border-border/70 py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <p className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-accent">The problem</p>
          <h2 className="max-w-4xl text-balance font-serif text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-primary">
            Africa&apos;s languages and land are still invisible to the AI systems shaping the next decade.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {stats.map((stat, i) => (
            <Reveal
              key={stat.value}
              delay={i * 120}
              className="flex flex-col gap-4 bg-background p-8 md:p-10"
            >
              <span className="font-serif text-6xl font-semibold tracking-tight text-accent md:text-7xl">
                {stat.value}
              </span>
              <span className="text-pretty leading-relaxed text-muted-foreground">{stat.label}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
