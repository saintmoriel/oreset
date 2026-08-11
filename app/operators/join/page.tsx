'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type FormState = {
  name: string
  email: string
  languages: string
  location: string
  experience: string
}

const initial: FormState = {
  name: '',
  email: '',
  languages: '',
  location: '',
  experience: '',
}

export default function OperatorsJoinPage() {
  const [values, setValues] = useState<FormState>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((v) => ({ ...v, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!values.name.trim()) next.name = 'Please enter your name.'
    if (!values.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = 'Enter a valid email.'
    }
    if (!values.languages.trim()) next.languages = 'Which languages do you speak natively?'
    if (!values.location.trim()) next.location = 'Where are you based?'
    setErrors(next)
    if (Object.keys(next).length) return

    setStatus('submitting')
    await new Promise((r) => setTimeout(r, 700))
    setStatus('success')
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border/70 bg-card/80 backdrop-blur-md">
        <div className="container-wide flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Oreset home">
            <span className="flex size-8 overflow-hidden rounded-md bg-paper-200">
              <Image src="/oreset-logo.png" alt="" width={32} height={32} className="size-8" />
            </span>
            <span className="font-display text-lg font-semibold tracking-display">Oreset</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to site
          </Link>
        </div>
      </header>

      <main className="container-wide py-12 sm:py-16 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <p className="text-eyebrow text-accent">Operators · Africa</p>
            <h1 className="text-h1 mt-4 text-balance text-foreground">
              Apply to the native language operator cohort.
            </h1>
            <p className="text-body-lg mt-5 text-pretty text-muted-foreground">
              We are accepting applications from African native speakers for Foundry
              training, certification, and placement on AI review and QA workflows.
            </p>
            <ul className="mt-8 space-y-3 text-body-sm text-muted-foreground">
              {[
                'Native fluency with dialect baselines',
                'Foundry curriculum and timed certification',
                'Paid placement on enterprise review benches',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="motif-dot mt-1.5 shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            {status === 'success' ? (
              <div className="card-surface-raised flex flex-col items-start gap-4 p-8" role="status">
                <span className="flex size-12 items-center justify-center rounded-xl bg-success/10">
                  <CheckCircle2 className="size-6 text-success" />
                </span>
                <h2 className="text-h3 text-foreground">Application received.</h2>
                <p className="text-body text-muted-foreground">
                  Thank you. The Operators team will review your submission and follow up if
                  your languages and location match an open cohort.
                </p>
                <Link href="/" className="text-body-sm font-semibold text-accent hover:text-copper-600">
                  Return to Oreset
                </Link>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                noValidate
                className="card-surface-raised space-y-4 p-6 sm:p-8"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" error={errors.name}>
                    <input
                      value={values.name}
                      onChange={(e) => update('name', e.target.value)}
                      className={fieldClass(Boolean(errors.name))}
                      autoComplete="name"
                      placeholder="Your name"
                    />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <input
                      type="email"
                      value={values.email}
                      onChange={(e) => update('email', e.target.value)}
                      className={fieldClass(Boolean(errors.email))}
                      autoComplete="email"
                      placeholder="you@email.com"
                    />
                  </Field>
                </div>

                <Field label="Native languages / dialects" error={errors.languages}>
                  <input
                    value={values.languages}
                    onChange={(e) => update('languages', e.target.value)}
                    className={fieldClass(Boolean(errors.languages))}
                    placeholder="e.g. Yorùbá, Hausa, Twi"
                  />
                </Field>

                <Field label="Location" error={errors.location}>
                  <input
                    value={values.location}
                    onChange={(e) => update('location', e.target.value)}
                    className={fieldClass(Boolean(errors.location))}
                    placeholder="City, country"
                  />
                </Field>

                <Field label="Relevant experience (optional)">
                  <textarea
                    value={values.experience}
                    onChange={(e) => update('experience', e.target.value)}
                    className={cn(fieldClass(false), 'min-h-[6rem] resize-y')}
                    placeholder="Annotation, QA, translation, teaching…"
                  />
                </Field>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:opacity-60"
                >
                  {status === 'submitting' ? 'Submitting…' : 'Submit application'}
                  {status !== 'submitting' && <ArrowRight className="size-4" />}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label className="text-body-sm font-medium text-foreground">{label}</label>
      <div className="mt-1.5">{children}</div>
      {error && (
        <p className="mt-1.5 text-caption text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function fieldClass(invalid: boolean) {
  return cn(
    'w-full rounded-lg border bg-background px-3.5 py-2.5 text-body outline-none placeholder:text-muted-foreground/70 focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20',
    invalid ? 'border-destructive/50' : 'border-border',
  )
}
