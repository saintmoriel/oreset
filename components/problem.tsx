import { Reveal } from './reveal'

const tasks = [
  {
    title: 'Translation & localization',
    body: 'Translate text and adapt AI responses so they sound natural to real speakers, not textbook-perfect.',
  },
  {
    title: 'Audio & transcription',
    body: 'Record prompts and transcribe speech to help models understand accents and dialects across the continent.',
  },
  {
    title: 'Writing & prompts',
    body: 'Create authentic questions, answers, and conversations in your language that teach models how people actually talk.',
  },
  {
    title: 'Evaluation & review',
    body: 'Rate and correct AI output for accuracy, tone, and cultural fit — the judgment only a native speaker can give.',
  },
]

export function Problem() {
  return (
    <section id="work" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-sm font-semibold uppercase tracking-eyebrow text-accent">
              What you do
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-display sm:text-4xl">
              Meaningful language work — not busywork.
            </h2>
            <p className="mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground">
              Every task you complete directly shapes how AI understands African
              languages and cultures. You choose the work that fits your skills.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
            {tasks.map((task, i) => (
              <Reveal key={task.title} delay={i * 70} className="bg-card">
                <div className="flex h-full flex-col p-7">
                  <h3 className="text-lg font-semibold tracking-display">{task.title}</h3>
                  <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                    {task.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
