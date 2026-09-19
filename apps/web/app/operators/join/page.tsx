'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { applyAsOperator, EXPERIENCE_LABELS } from '@/lib/api/endpoints/operators'
import type { SecurityExperienceYears } from '@/lib/api/endpoints/operators'
import { ApiError } from '@/lib/api/client'
import { toast } from '@/components/ui/toast'

const FLUENCY_LEVELS = ['Native', 'Fluent', 'Professional', 'Conversational']
const AVAILABILITY_OPTIONS = ['Weekday daytime', 'Weekday evenings', 'Weekends', 'Full time']

type LanguageRow = { language: string; fluency: string }

type FormState = {
  name: string
  email: string
  phone: string
  password: string
  location: string
  securityExperienceYears: SecurityExperienceYears | ''
  experience: string
  aiRedTeamExposure: string
  tools: string
  workSample: string
  portfolioUrl: string
  languages: LanguageRow[]
  availability: string[]
}

const initial: FormState = {
  name: '',
  email: '',
  phone: '',
  password: '',
  location: '',
  securityExperienceYears: '',
  experience: '',
  aiRedTeamExposure: '',
  tools: '',
  workSample: '',
  portfolioUrl: '',
  languages: [{ language: 'English', fluency: '' }],
  availability: [],
}

type FieldErrors = Partial<Record<keyof FormState, string>>

const WORK_SAMPLE_BRIEF =
  'A payments company runs an AI support agent. It can look up a customer’s balance and transactions, open a dispute, explain policies, and reverse a transfer once the customer passes step-up identity verification. Describe the first three things you would try to make this agent do something it should not, and for each one, what result would tell you the agent failed.'

export default function OperatorsJoinPage() {
  const [values, setValues] = useState<FormState>(initial)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [operatorCode, setOperatorCode] = useState<string | null>(null)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((v) => ({ ...v, [key]: value }))
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function updateLanguageRow(index: number, patch: Partial<LanguageRow>) {
    setValues((v) => ({ ...v, languages: v.languages.map((row, i) => (i === index ? { ...row, ...patch } : row)) }))
    setErrors((e) => ({ ...e, languages: undefined }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const next: FieldErrors = {}
    if (!values.name.trim()) next.name = 'Please enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) next.email = 'Enter a valid email.'
    if (values.phone.trim().length < 8) next.phone = 'Please enter a phone number.'
    if (values.password.length < 8) next.password = 'Use at least 8 characters.'
    if (!values.location.trim()) next.location = 'Where are you based?'
    if (!values.securityExperienceYears) next.securityExperienceYears = 'Pick the closest option.'
    if (values.experience.trim().length < 20) next.experience = 'A few sentences, please. This is what the reviewer reads first.'
    if (values.workSample.trim().length < 80) next.workSample = 'Give us at least a short paragraph. This is the most important part of the application.'
    if (values.portfolioUrl && !/^https?:\/\//.test(values.portfolioUrl.trim())) next.portfolioUrl = 'Include https:// at the start.'
    if (!values.languages.some((row) => row.language.trim() && row.fluency)) next.languages = 'Add at least one language with a level.'
    setErrors(next)
    if (Object.keys(next).length) {
      toast.error('Some answers are missing', 'Check the highlighted fields.')
      return
    }

    setStatus('submitting')
    try {
      const { user } = await applyAsOperator({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
        location: values.location.trim(),
        languages: values.languages.filter((row) => row.language.trim() && row.fluency),
        securityExperienceYears: values.securityExperienceYears as SecurityExperienceYears,
        experience: values.experience.trim(),
        aiRedTeamExposure: values.aiRedTeamExposure.trim() || undefined,
        tools: values.tools.trim() || undefined,
        workSample: values.workSample.trim(),
        portfolioUrl: values.portfolioUrl.trim() || undefined,
        availability: values.availability.length ? values.availability : undefined,
      })
      setOperatorCode(user.operatorCode)
      setStatus('success')
      toast.success('Application received', `Your tester code is ${user.operatorCode}. We will email you when a lead has reviewed it.`)
    } catch (err) {
      const message = err instanceof ApiError && err.code === 'email_taken'
        ? 'An account with that email already exists.'
        : err instanceof ApiError ? err.message : 'Could not submit your application. Try again.'
      setErrors((e) => ({ ...e, email: message }))
      toast.error('Not submitted', message)
      setStatus('idle')
    }
  }

  return (
    <div className="min-h-svh overflow-y-auto bg-background">
      <header className="border-b border-border/70 bg-card/80 backdrop-blur-md">
        <div className="container-wide flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Oreset home">
            <span className="flex size-8 overflow-hidden rounded-md bg-paper-200">
              <Image src="/oreset-logo.png" alt="" width={32} height={32} className="size-8" />
            </span>
            <span className="font-display text-lg font-semibold tracking-display">Oreset</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-body-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            Back to site
          </Link>
        </div>
      </header>

      <main className="container-wide py-12 sm:py-16 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <p className="cx-label text-accent">Oreset Red Team</p>
            <h1 className="cx-page-title mt-4 text-balance text-navy-900">Apply to test AI agents for a living.</h1>
            <p className="cx-body mt-5 text-pretty text-navy-500">
              We pay security testers and sharp analysts to attack production AI agents for fintech,
              payments, and lending companies, and to catch the decisions those agents get wrong with
              no attack at all. Remote, paid per engagement, Africa-first but not Africa-only.
            </p>
            <ul className="mt-8 space-y-3 cx-meta text-navy-500">
              {[
                'A lead auditor reads every application. No automated screening.',
                'Approved testers sign an NDA and pass two calibration scenarios before any live work.',
                'Findings you write go to real clients with your reasoning attached.',
                'Languages matter: agents fail differently in Pidgin, Hausa, or Swahili than in English.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="motif-dot mt-1.5 shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="cx-meta mt-8 text-navy-400">
              Already applied? <Link href="/operator" className="font-semibold text-accent hover:text-copper-600">Sign in</Link> to see your status.
            </p>
          </div>

          <div className="lg:col-span-7">
            {status === 'success' ? (
              <div className="cx-card flex flex-col items-start gap-4 p-8" role="status">
                <span className="flex size-12 items-center justify-center rounded-xl bg-success/10">
                  <CheckCircle2 className="size-6 text-success" />
                </span>
                <h2 className="cx-title text-navy-900">Application received.</h2>
                {operatorCode && (
                  <p className="cx-meta text-navy-500">
                    Your tester code is <strong className="cx-mono-meta font-semibold text-navy-900">{operatorCode}</strong>. A confirmation is on its way to your email.
                  </p>
                )}
                <p className="cx-body text-navy-500">
                  A lead auditor will read your work sample and reply by email, usually within a few working
                  days. If approved, you will sign the agreements and complete two calibration scenarios
                  before your first live engagement.
                </p>
                <Link href="/operator" className="cx-meta font-semibold text-accent hover:text-copper-600">
                  Sign in to see your application status
                </Link>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="cx-card space-y-6 p-6 sm:p-8">
                <section className="space-y-4">
                  <p className="cx-label text-navy-400">About you</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" error={errors.name}>
                      <input value={values.name} onChange={(e) => update('name', e.target.value)} className={fieldClass(!!errors.name)} autoComplete="name" placeholder="Your name" />
                    </Field>
                    <Field label="Email" error={errors.email}>
                      <input type="email" value={values.email} onChange={(e) => update('email', e.target.value)} className={fieldClass(!!errors.email)} autoComplete="email" placeholder="you@email.com" />
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Phone or WhatsApp" error={errors.phone}>
                      <input type="tel" value={values.phone} onChange={(e) => update('phone', e.target.value)} className={fieldClass(!!errors.phone)} autoComplete="tel" placeholder="+234 8XX XXX XXXX" />
                    </Field>
                    <Field label="Location" error={errors.location}>
                      <input value={values.location} onChange={(e) => update('location', e.target.value)} className={fieldClass(!!errors.location)} placeholder="City, country" />
                    </Field>
                  </div>
                  <Field label="Choose a password" error={errors.password} hint="You will use it to sign in and follow your application.">
                    <input type="password" value={values.password} onChange={(e) => update('password', e.target.value)} className={fieldClass(!!errors.password)} autoComplete="new-password" placeholder="At least 8 characters" />
                  </Field>
                </section>

                <section className="space-y-4 border-t border-border/70 pt-6">
                  <p className="cx-label text-navy-400">Security and AI testing background</p>
                  <Field label="Years of professional security testing" error={errors.securityExperienceYears} hint="Pentesting, bug bounty, red team, application security, or QA with a security focus.">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(Object.keys(EXPERIENCE_LABELS) as SecurityExperienceYears[]).map((k) => (
                        <label key={k} className={cn('flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 cx-meta cx-fade', values.securityExperienceYears === k ? 'border-accent/50 bg-accent/5' : 'border-border')}>
                          <input type="radio" name="years" checked={values.securityExperienceYears === k} onChange={() => update('securityExperienceYears', k)} className="size-4 accent-accent" />
                          <span className="text-foreground">{EXPERIENCE_LABELS[k]}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                  <Field label="Your experience, in your own words" error={errors.experience} hint="What have you tested, for whom, and what did you find? Bug bounty handles and CTF results count.">
                    <textarea value={values.experience} onChange={(e) => update('experience', e.target.value)} className={cn(fieldClass(!!errors.experience), 'min-h-[6rem] resize-y')} placeholder="Three years of web application testing for two Nigerian banks, mostly auth and payment flows. Top 10% on HackerOne for..." />
                  </Field>
                  <Field label="Have you tested an LLM, chatbot, or AI agent before?" hint="Optional. Prompt injection, jailbreaks, tool misuse, evaluation work, or even structured personal experiments. Say what you tried and what happened.">
                    <textarea value={values.aiRedTeamExposure} onChange={(e) => update('aiRedTeamExposure', e.target.value)} className={cn(fieldClass(false), 'min-h-[5rem] resize-y')} placeholder="I got a customer-service bot to reveal its system prompt by..." />
                  </Field>
                  <Field label="Tools and techniques you use" hint="Optional. Burp, custom scripts, Garak, PyRIT, manual only, whatever is true.">
                    <input value={values.tools} onChange={(e) => update('tools', e.target.value)} className={fieldClass(false)} placeholder="Burp Suite, Python, manual prompt work" />
                  </Field>
                </section>

                <section className="space-y-3 border-t border-border/70 pt-6">
                  <p className="cx-label text-navy-400">Work sample</p>
                  <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
                    <p className="cx-meta font-semibold text-navy-800">The brief</p>
                    <p className="cx-meta mt-1 text-navy-600">{WORK_SAMPLE_BRIEF}</p>
                  </div>
                  <Field label="Your answer" error={errors.workSample} hint="This is what decides the application. Precision beats length. Around 150 to 400 words.">
                    <textarea value={values.workSample} onChange={(e) => update('workSample', e.target.value)} className={cn(fieldClass(!!errors.workSample), 'min-h-[12rem] resize-y')} placeholder="1. I would start by..." />
                  </Field>
                </section>

                <section className="space-y-3 border-t border-border/70 pt-6">
                  <p className="cx-label text-navy-400">Languages</p>
                  <Field label="Languages you can test in" error={errors.languages} hint="Agents behave differently across languages. English plus anything else you speak well.">
                    <div className="space-y-2">
                      {values.languages.map((row, i) => (
                        <div key={i} className="flex gap-2">
                          <input value={row.language} onChange={(e) => updateLanguageRow(i, { language: e.target.value })} className={fieldClass(false)} placeholder="e.g. Nigerian Pidgin" />
                          <select value={row.fluency} onChange={(e) => updateLanguageRow(i, { fluency: e.target.value })} className={cn(fieldClass(false), 'max-w-40')}>
                            <option value="">Level</option>
                            {FLUENCY_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
                          </select>
                          {values.languages.length > 1 && (
                            <button type="button" onClick={() => setValues((v) => ({ ...v, languages: v.languages.filter((_, j) => j !== i) }))} aria-label="Remove language" className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
                              <X className="size-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => setValues((v) => ({ ...v, languages: [...v.languages, { language: '', fluency: '' }] }))} className="mt-2 inline-flex items-center gap-1.5 cx-meta font-medium text-accent hover:text-copper-600">
                      <Plus className="size-4" /> Add another language
                    </button>
                  </Field>
                </section>

                <section className="space-y-4 border-t border-border/70 pt-6">
                  <p className="cx-label text-navy-400">Practical</p>
                  <Field label="Availability" hint="Optional. Engagements run one to two weeks; most testers work a few evenings per engagement.">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {AVAILABILITY_OPTIONS.map((opt) => (
                        <label key={opt} className={cn('flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 cx-meta cx-fade', values.availability.includes(opt) ? 'border-accent/50 bg-accent/5' : 'border-border')}>
                          <input type="checkbox" checked={values.availability.includes(opt)} onChange={() => update('availability', values.availability.includes(opt) ? values.availability.filter((o) => o !== opt) : [...values.availability, opt])} className="size-4 accent-accent" />
                          <span className="text-foreground">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                  <Field label="Portfolio, GitHub, HackerOne, or LinkedIn" error={errors.portfolioUrl} hint="Optional, one link.">
                    <input value={values.portfolioUrl} onChange={(e) => update('portfolioUrl', e.target.value)} className={fieldClass(!!errors.portfolioUrl)} placeholder="https://" />
                  </Field>
                </section>

                <div className="border-t border-border/70 pt-6">
                  <button type="submit" disabled={status === 'submitting'} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:opacity-60">
                    {status === 'submitting' ? 'Submitting…' : 'Submit application'}
                    {status !== 'submitting' && <ArrowRight className="size-4" />}
                  </button>
                  <p className="cx-meta mt-3 text-center text-navy-400">
                    By applying you agree to keep anything you learn about client systems confidential, before and after any NDA.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label className="cx-meta font-medium text-navy-800">{label}</label>
      {hint && <p className="cx-meta mt-0.5 text-navy-400">{hint}</p>}
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1.5 cx-meta text-destructive" role="alert">{error}</p>}
    </div>
  )
}

function fieldClass(invalid: boolean) {
  return cn(
    'w-full rounded-lg border bg-background px-3.5 py-2.5 cx-body outline-none placeholder:text-muted-foreground/70 focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20',
    invalid ? 'border-destructive/50' : 'border-border',
  )
}
