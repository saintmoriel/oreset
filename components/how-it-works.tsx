import { Reveal } from './reveal'

const steps = [
  {
    n: '01',
    title: 'Apply and verify',
    body: 'Tell us your languages and areas of expertise. We confirm fluency with a short assessment so every contributor is genuinely qualified.',
  },
  {
    n: '02',
    title: 'Work on real tasks',
    body: 'Translate, transcribe, write, and evaluate AI output in your language. Pick up tasks whenever it suits you, from any device.',
  },
  {
    n: '03',
    title: 'Get paid reliably',
    body: 'Approved work is paid on a predictable schedule through payment methods that work where you live. No delays, no guesswork.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border bg-secondary py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-eyebrow text-accent">
            How it works
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-display sm:text-4xl">
            From sign-up to your first payout in three steps.
          </h2>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 90}>
              <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-7">
                <span className="text-sm font-semibold text-accent">{step.n}</span>
                <h3 className="mt-4 text-xl font-semibold tracking-display">{step.title}</h3>
                <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
