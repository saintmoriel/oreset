'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const FLUENCY_LEVELS = ['Native', 'Level 4', 'Level 3', 'Level 2', 'Level 1']
const ACADEMIC_BACKGROUNDS = [
  "Secondary",
  "Tertiary — Bachelor's",
  'Tertiary — Postgraduate',
  'Vocational / Technical',
  'No formal qualification',
]
const ENGLISH_PROFICIENCIES = [
  'Native / fluent',
  'Professional working proficiency',
  'Conversational',
  'Basic',
]
const AVAILABILITY_OPTIONS = ['Weekday mornings', 'Weekday afternoons', 'Weekday evenings', 'Weekends']

type LanguageRow = { language: string; fluency: string }

type FormState = {
  name: string
  email: string
  phone: string
  location: string
  languages: LanguageRow[]
  dialect: string
  academicBackground: string
  englishProficiency: string
  availability: string[]
  experience: string
}

const initial: FormState = {
  name: '',
  email: '',
  phone: '',
  location: '',
  languages: [{ language: '', fluency: '' }],
  dialect: '',
  academicBackground: '',
  englishProficiency: '',
  availability: [],
  experience: '',
}

type FieldErrors = Partial<Record<'name' | 'email' | 'phone' | 'location' | 'languages' | 'academicBackground' | 'englishProficiency', string>>

export default function OperatorsJoinPage() {
  const [values, setValues] = useState<FormState>(initial)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((v) => ({ ...v, [key]: value }))
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function updateLanguageRow(index: number, patch: Partial<LanguageRow>) {
    setValues((v) => ({
      ...v,
      languages: v.languages.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }))
    setErrors((e) => ({ ...e, languages: undefined }))
  }

  function addLanguageRow() {
    setValues((v) => ({ ...v, languages: [...v.languages, { language: '', fluency: '' }] }))
  }

  function removeLanguageRow(index: number) {
    setValues((v) => ({ ...v, languages: v.languages.filter((_, i) => i !== index) }))
  }

  function toggleAvailability(option: string) {
    setValues((v) => ({
      ...v,
      availability: v.availability.includes(option)
        ? v.availability.filter((o) => o !== option)
        : [...v.availability, option],
    }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const next: FieldErrors = {}
    if (!values.name.trim()) next.name = 'Please enter your full name.'
    if (!values.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = 'Enter a valid email.'
    }
    if (!values.phone.trim()) next.phone = 'Please enter a phone number.'
    if (!values.location.trim()) next.location = 'Where are you based?'
    if (!values.languages.some((row) => row.language.trim() && row.fluency)) {
      next.languages = 'Add at least one language with a fluency level.'
    }
    if (!values.academicBackground) next.academicBackground = 'Select your academic background.'
    if (!values.englishProficiency) next.englishProficiency = 'Select your operational English proficiency.'
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
              We are accepting applications from African native speakers for training,
              certification, and placement on AI review and QA workflows.
            </p>
            <ul className="mt-8 space-y-3 text-body-sm text-muted-foreground">
              {[
                'Native fluency with dialect baselines',
                'Training and timed certification',
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
                className="card-surface-raised space-y-6 p-6 sm:p-8"
              >
                <div className="space-y-4">
                  <p className="text-eyebrow text-muted-foreground">Contact details</p>
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
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Phone number" error={errors.phone}>
                      <input
                        type="tel"
                        value={values.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        className={fieldClass(Boolean(errors.phone))}
                        autoComplete="tel"
                        placeholder="+234 8XX XXX XXXX"
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
                  </div>
                </div>

                <div className="space-y-3 border-t border-border/70 pt-6">
                  <p className="text-eyebrow text-muted-foreground">Languages</p>
                  <Field label="Native language(s) with fluency" error={errors.languages}>
                    <div className="space-y-2">
                      {values.languages.map((row, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            value={row.language}
                            onChange={(e) => updateLanguageRow(i, { language: e.target.value })}
                            className={fieldClass(false)}
                            placeholder="e.g. Yorùbá"
                          />
                          <select
                            value={row.fluency}
                            onChange={(e) => updateLanguageRow(i, { fluency: e.target.value })}
                            className={cn(fieldClass(false), 'max-w-36')}
                          >
                            <option value="">Fluency</option>
                            {FLUENCY_LEVELS.map((level) => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </select>
                          {values.languages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLanguageRow(i)}
                              aria-label="Remove language"
                              className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
                            >
                              <X className="size-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addLanguageRow}
                      className="mt-2 inline-flex items-center gap-1.5 text-body-sm font-medium text-accent hover:text-copper-600"
                    >
                      <Plus className="size-4" />
                      Add another language
                    </button>
                  </Field>

                  <Field label="Regional dialect variation (optional)">
                    <input
                      value={values.dialect}
                      onChange={(e) => update('dialect', e.target.value)}
                      className={fieldClass(false)}
                      placeholder="e.g. Ìjẹ̀bú dialect"
                    />
                  </Field>
                </div>

                <div className="grid gap-4 border-t border-border/70 pt-6 sm:grid-cols-2">
                  <Field label="Academic background" error={errors.academicBackground}>
                    <select
                      value={values.academicBackground}
                      onChange={(e) => update('academicBackground', e.target.value)}
                      className={fieldClass(Boolean(errors.academicBackground))}
                    >
                      <option value="">Select one</option>
                      {ACADEMIC_BACKGROUNDS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Operational English proficiency" error={errors.englishProficiency}>
                    <select
                      value={values.englishProficiency}
                      onChange={(e) => update('englishProficiency', e.target.value)}
                      className={fieldClass(Boolean(errors.englishProficiency))}
                    >
                      <option value="">Select one</option>
                      {ENGLISH_PROFICIENCIES.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="border-t border-border/70 pt-6">
                  <p className="text-body-sm font-medium text-foreground">
                    Availability / preferred working hours <span className="text-muted-foreground">(optional)</span>
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <label
                        key={opt}
                        className={cn(
                          'flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 text-body-sm transition-colors',
                          values.availability.includes(opt) ? 'border-accent/50 bg-accent/5' : 'border-border',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={values.availability.includes(opt)}
                          onChange={() => toggleAvailability(opt)}
                          className="size-4 accent-accent"
                        />
                        <span className="text-foreground">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border/70 pt-6">
                  <Field label="Relevant experience (optional)">
                    <textarea
                      value={values.experience}
                      onChange={(e) => update('experience', e.target.value)}
                      className={cn(fieldClass(false), 'min-h-[6rem] resize-y')}
                      placeholder="Annotation, QA, translation, teaching…"
                    />
                  </Field>
                </div>

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
