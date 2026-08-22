'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, GraduationCap, Loader2 } from 'lucide-react'
import { QueueShell } from '@/components/shared/queue-shell'
import { certifyOperator } from '@/lib/api/endpoints/operators'
import { ApiError } from '@/lib/api/client'
import { cn } from '@/lib/utils'

const LESSONS = [
  {
    title: 'Pacing',
    body: 'Read at the pace a careful, unhurried native speaker would use in everyday conversation — neither rushed nor artificially slow. Flag audio or transcripts that sound rushed, robotic, or padded with unnatural pauses.',
  },
  {
    title: 'Clarity',
    body: 'Every word should be distinguishable without requiring a replay. Mumbled consonants, swallowed word-endings, or crosstalk are defects — tag them, do not wave them through because "you can mostly tell what they meant."',
  },
  {
    title: 'Spontaneity',
    body: 'Natural speech has the small imperfections of real conversation — it is not a stiff read-aloud performance. But spontaneity is not sloppiness: false starts and fillers are fine; genuine confusion or off-brief answers are not.',
  },
]

const QUIZ = [
  {
    question: 'A recording sounds like the speaker is reading from a script in a monotone. Which standard does this violate?',
    options: ['Pacing', 'Clarity', 'Spontaneity'],
    answer: 'Spontaneity',
  },
  {
    question: 'You can understand a transcript, but the speaker mumbles the last word of every sentence. Approve or flag?',
    options: ['Approve — you got the gist', 'Flag — clarity requires every word to be distinguishable'],
    answer: 'Flag — clarity requires every word to be distinguishable',
  },
  {
    question: 'A response is delivered so fast it feels rushed and hard to follow. Which standard applies?',
    options: ['Pacing', 'Clarity', 'Spontaneity'],
    answer: 'Pacing',
  },
  {
    question: 'A bot response confidently answers a question the customer never asked. Is this an acceptable "natural imperfection"?',
    options: ['Yes — spontaneity allows small imperfections', 'No — an off-brief answer is a defect, not a natural imperfection'],
    answer: 'No — an off-brief answer is a defect, not a natural imperfection',
  },
]

export default function FoundryPage() {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)
  const [certifying, setCertifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allAnswered = QUIZ.every((_, i) => answers[i])
  const allCorrect = QUIZ.every((q, i) => answers[i] === q.answer)

  async function onCertify() {
    setCertifying(true)
    setError(null)
    try {
      await certifyOperator()
      router.push('/operator/queue')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not complete certification. Try again.')
    } finally {
      setCertifying(false)
    }
  }

  return (
    <QueueShell badge="Foundry" signOutHref="/operator" step={0}>
      <div className="card-surface-raised p-8 sm:p-10">
        <span className="flex size-12 items-center justify-center rounded-xl bg-accent/10">
          <GraduationCap className="size-6 text-accent" />
        </span>
        <p className="text-eyebrow mt-5 text-accent">Foundry · Certification</p>
        <h1 className="text-h2 mt-2 text-balance text-foreground">
          Complete training to unlock your first placement
        </h1>
        <p className="text-body mt-3 text-pretty text-muted-foreground">
          These are the TWB Voice Playbook standards every reviewer is held to. Read each, then
          answer the check below.
        </p>

        <div className="mt-6 space-y-4">
          {LESSONS.map((lesson) => (
            <div key={lesson.title} className="rounded-xl border border-border bg-paper-100 p-5">
              <p className="text-body-sm font-semibold text-foreground">{lesson.title}</p>
              <p className="text-body-sm mt-1.5 text-muted-foreground">{lesson.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-5 border-t border-border/70 pt-6">
          <p className="text-body-sm font-semibold text-foreground">Quick check</p>
          {QUIZ.map((q, i) => (
            <div key={i}>
              <p className="text-body-sm text-foreground">{q.question}</p>
              <div className="mt-2 space-y-2">
                {q.options.map((opt) => (
                  <label
                    key={opt}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-body-sm transition-colors',
                      answers[i] === opt ? 'border-accent/50 bg-accent/5' : 'border-border bg-background',
                      checked && answers[i] === opt && opt !== q.answer && 'border-destructive/50 bg-destructive/5',
                      checked && opt === q.answer && 'border-success/50 bg-success/5',
                    )}
                  >
                    <input
                      type="radio"
                      name={`quiz-${i}`}
                      checked={answers[i] === opt}
                      onChange={() => setAnswers((a) => ({ ...a, [i]: opt }))}
                      className="size-4 accent-accent"
                    />
                    <span className="text-foreground">{opt}</span>
                    {checked && opt === q.answer && <CheckCircle2 className="ml-auto size-4 text-success" />}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-4 text-caption text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="mt-8">
          {!checked ? (
            <button
              onClick={() => setChecked(true)}
              disabled={!allAnswered}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              Check answers
            </button>
          ) : allCorrect ? (
            <button
              onClick={onCertify}
              disabled={certifying}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {certifying ? <Loader2 className="size-4 animate-spin" /> : <GraduationCap className="size-4" />}
              {certifying ? 'Certifying…' : 'Certify and enter queue'}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-body-sm text-destructive">
                A few answers need another look — check the highlighted questions above.
              </p>
              <button
                onClick={() => setChecked(false)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border px-6 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </QueueShell>
  )
}
