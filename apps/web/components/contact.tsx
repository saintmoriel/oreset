'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { submitLead } from '@/lib/api/endpoints/leads'
import { ApiError, describeError } from '@/lib/api/client'
import { toast } from '@/components/ui/toast'

// The form branches on intent. A prospective client gets the questions a
// person needs to qualify the lead in one read. Someone who wants to join is
// sent to the real application instead of a note box. Everyone else gets a
// message field.

type Intent = 'client' | 'join' | 'other' | ''

const INTENTS: { value: Exclude<Intent, ''>; label: string; hint: string }[] = [
  { value: 'client', label: 'Test my AI agent', hint: 'Before launch, after a change, or on a schedule' },
  { value: 'join', label: 'Join the red team', hint: 'Paid work testing AI agents' },
  { value: 'other', label: 'Something else', hint: 'Press, partnership, a question' },
]

const AGENT_STAGES = ['Not launched yet', 'Live with a small group', 'Live with all customers']
const CAPABILITIES = [
  'Moves money or approves transactions',
  'Changes account or customer data',
  'Reads customer data to answer questions',
  'Talks to customers, no tools attached',
  'Makes decisions on applications or claims',
]
const TIMELINES = ['This month', 'This quarter', 'Just exploring']

type FormState = {
  name: string
  email: string
  intent: Intent
  organization: string
  role: string
  agentDescription: string
  capabilities: string[]
  stage: string
  timeline: string
  message: string
}

const initial: FormState = {
  name: '',
  email: '',
  intent: '',
  organization: '',
  role: '',
  agentDescription: '',
  capabilities: [],
  stage: '',
  timeline: '',
  message: '',
}

type FieldErrors = Partial<Record<keyof FormState, string>>

function validate(v: FormState): FieldErrors {
  const e: FieldErrors = {}
  if (!v.name.trim()) e.name = 'Please enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = 'Enter a valid email.'
  if (!v.intent) e.intent = 'Tell us what this is about.'
  if (v.intent === 'client') {
    if (!v.organization.trim()) e.organization = 'Which company or product?'
    if (v.agentDescription.trim().length < 20) e.agentDescription = 'A sentence or two is enough: what does the agent do and for whom?'
    if (v.capabilities.length === 0) e.capabilities = 'Pick at least one. It decides which tests we run.'
    if (!v.stage) e.stage = 'Where is it in its life?'
    if (!v.timeline) e.timeline = 'Rough timing helps us schedule.'
  }
  if (v.intent === 'other' && v.message.trim().length < 12) e.message = 'A short note so we can route it.'
  return e
}

export function Contact() {
  const reduceMotion = useReducedMotion()
  const [values, setValues] = useState<FormState>(initial)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((v) => ({ ...v, [key]: value }))
    if (touched[key]) setErrors((e) => ({ ...e, [key]: validate({ ...values, [key]: value })[key] }))
  }
  function onBlur(key: keyof FormState) {
    setTouched((t) => ({ ...t, [key]: true }))
    setErrors((e) => ({ ...e, [key]: validate(values)[key] }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const next = validate(values)
    setErrors(next)
    setTouched(Object.fromEntries(Object.keys(initial).map((k) => [k, true])))
    if (Object.keys(next).length) {
      toast.error('A few details are missing', 'Check the highlighted fields.')
      return
    }

    // Structured answers are folded into the message so the Leads inbox
    // reads as one block, and the key ones are also stored as columns.
    const message = values.intent === 'client'
      ? [
          `Role: ${values.role || 'not given'}`,
          `Agent: ${values.agentDescription.trim()}`,
          `Can: ${values.capabilities.join('; ')}`,
          `Stage: ${values.stage}`,
          `Timeline: ${values.timeline}`,
          values.message.trim() ? `\n${values.message.trim()}` : '',
        ].join('\n')
      : values.message.trim()

    setStatus('submitting')
    try {
      await submitLead({
        kind: 'contact',
        name: values.name.trim(),
        email: values.email.trim(),
        organization: values.organization.trim() || undefined,
        agentType: values.intent === 'client' ? values.capabilities[0] : undefined,
        audience: values.intent === 'client' ? 'Test my AI agent' : 'Something else',
        message,
        sourcePath: window.location.pathname,
      })
      setStatus('success')
      toast.success('Message received', 'A person on the team will reply, usually within one working day.')
    } catch (err) {
      setStatus('idle')
      const m = describeError(err, 'Could not send your message. Check your connection and try again.')
      setErrors((e) => ({ ...e, message: m }))
      toast.error('Not sent', m)
    }
  }

  const fade = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  })

  return (
    <section id="contact" className="relative overflow-hidden border-t border-border/60 py-16 sm:py-24 md:py-32 lg:py-40">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary/50 via-transparent to-transparent" aria-hidden="true" />

      <div className="container-wide relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <motion.p className="text-eyebrow text-accent" {...fade(0)}>Get in touch</motion.p>
            <motion.h2 className="text-h1 mt-4 text-balance text-foreground" {...fade(0.06)}>
              Someone will find out what your agent does under pressure. It should be you.
            </motion.h2>
            <motion.p className="text-body-lg mt-5 text-pretty text-muted-foreground" {...fade(0.12)}>
              We&apos;re onboarding early partners shipping AI agents in fintech, payments, and lending.
              Tell us what your agent does and what it can touch. A person replies, usually the same day.
            </motion.p>
            <p className="mt-8 text-body-sm text-muted-foreground">
              Or email{' '}
              <a href="mailto:info@oreset.africa" className="font-medium text-accent underline-offset-4 hover:underline">info@oreset.africa</a>
            </p>
          </div>

          <motion.div className="lg:col-span-7" {...fade(0.1)}>
            {status === 'success' ? (
              <div className="card-surface-raised flex flex-col items-start gap-4 p-8 md:p-10" role="status" aria-live="polite">
                <span className="flex size-12 items-center justify-center rounded-xl bg-success/10">
                  <CheckCircle2 className="size-6 text-success" aria-hidden="true" />
                </span>
                <h3 className="text-h3 text-foreground">Received. Thank you.</h3>
                <p className="text-body text-muted-foreground">
                  A confirmation is on its way to {values.email}. A person will reply, usually within one working day.
                  If your timeline is tight, reply to that email and say so.
                </p>
                <button type="button" onClick={() => { setStatus('idle'); setValues(initial); setErrors({}); setTouched({}) }} className="mt-2 text-body-sm font-semibold text-accent hover:text-copper-600">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="card-surface-raised space-y-5 p-6 md:p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="name" label="Name" error={touched.name ? errors.name : undefined}>
                    <input id="name" autoComplete="name" value={values.name} onChange={(e) => update('name', e.target.value)} onBlur={() => onBlur('name')} className={fieldClass(!!(touched.name && errors.name))} placeholder="Your name" />
                  </Field>
                  <Field id="email" label="Work email" error={touched.email ? errors.email : undefined}>
                    <input id="email" type="email" autoComplete="email" value={values.email} onChange={(e) => update('email', e.target.value)} onBlur={() => onBlur('email')} className={fieldClass(!!(touched.email && errors.email))} placeholder="you@company.com" />
                  </Field>
                </div>

                <fieldset>
                  <legend className="text-body-sm font-medium text-foreground">What is this about?</legend>
                  <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    {INTENTS.map((opt) => (
                      <label key={opt.value} className={cn('cursor-pointer rounded-lg border px-3.5 py-3 transition-colors', values.intent === opt.value ? 'border-accent bg-copper-50 text-foreground' : 'border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground')}>
                        <input type="radio" name="intent" value={opt.value} checked={values.intent === opt.value} onChange={() => { update('intent', opt.value); setTouched((t) => ({ ...t, intent: true })) }} className="sr-only" />
                        <span className="block text-body-sm font-semibold text-foreground">{opt.label}</span>
                        <span className="mt-1 block text-caption opacity-80">{opt.hint}</span>
                      </label>
                    ))}
                  </div>
                  {touched.intent && errors.intent && <p className="mt-2 text-caption text-destructive" role="alert">{errors.intent}</p>}
                </fieldset>

                {values.intent === 'join' && (
                  <div className="rounded-lg border border-accent/30 bg-copper-50 p-5">
                    <div className="flex items-start gap-3">
                      <Users className="mt-0.5 size-5 shrink-0 text-accent" />
                      <div>
                        <p className="text-body font-semibold text-foreground">The red team has its own application.</p>
                        <p className="text-body-sm mt-1 text-muted-foreground">
                          It asks about your security testing background and includes a short work sample a lead auditor reads personally. It takes about fifteen minutes.
                        </p>
                        <Link href="/operators/join" className="mt-3 inline-flex h-11 items-center gap-2 rounded-md bg-accent px-5 text-body-sm font-semibold text-accent-foreground hover:bg-copper-600">
                          Go to the application <ArrowRight className="size-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {values.intent === 'client' && (
                  <>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field id="organization" label="Company or product" error={touched.organization ? errors.organization : undefined}>
                        <input id="organization" value={values.organization} onChange={(e) => update('organization', e.target.value)} onBlur={() => onBlur('organization')} className={fieldClass(!!(touched.organization && errors.organization))} placeholder="e.g. SafariPay" />
                      </Field>
                      <Field id="role" label="Your role" hint="Optional">
                        <input id="role" value={values.role} onChange={(e) => update('role', e.target.value)} className={fieldClass(false)} placeholder="CTO, Head of Engineering, Security lead" />
                      </Field>
                    </div>

                    <Field id="agentDescription" label="What does the agent do, and for whom?" error={touched.agentDescription ? errors.agentDescription : undefined}>
                      <textarea id="agentDescription" rows={3} value={values.agentDescription} onChange={(e) => update('agentDescription', e.target.value)} onBlur={() => onBlur('agentDescription')} className={cn(fieldClass(!!(touched.agentDescription && errors.agentDescription)), 'min-h-[5rem] resize-y')} placeholder="Customer support agent for our payments app. Handles balance questions, disputes, and transfer issues for about 40,000 users." />
                    </Field>

                    <fieldset>
                      <legend className="text-body-sm font-medium text-foreground">What can it actually do?</legend>
                      <p className="mt-0.5 text-caption text-muted-foreground">Tick everything that applies. This decides which tests matter most.</p>
                      <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                        {CAPABILITIES.map((c) => (
                          <label key={c} className={cn('flex cursor-pointer items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-body-sm transition-colors', values.capabilities.includes(c) ? 'border-accent bg-copper-50 text-foreground' : 'border-border bg-background text-muted-foreground hover:border-foreground/20')}>
                            <input type="checkbox" checked={values.capabilities.includes(c)} onChange={() => { const next = values.capabilities.includes(c) ? values.capabilities.filter((x) => x !== c) : [...values.capabilities, c]; update('capabilities', next); setTouched((t) => ({ ...t, capabilities: true })) }} className="mt-0.5 size-4 accent-accent" />
                            <span>{c}</span>
                          </label>
                        ))}
                      </div>
                      {touched.capabilities && errors.capabilities && <p className="mt-2 text-caption text-destructive" role="alert">{errors.capabilities}</p>}
                    </fieldset>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field id="stage" label="Where is it?" error={touched.stage ? errors.stage : undefined}>
                        <select id="stage" value={values.stage} onChange={(e) => { update('stage', e.target.value); setTouched((t) => ({ ...t, stage: true })) }} className={fieldClass(!!(touched.stage && errors.stage))}>
                          <option value="">Select</option>
                          {AGENT_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </Field>
                      <Field id="timeline" label="When do you want testing done?" error={touched.timeline ? errors.timeline : undefined}>
                        <select id="timeline" value={values.timeline} onChange={(e) => { update('timeline', e.target.value); setTouched((t) => ({ ...t, timeline: true })) }} className={fieldClass(!!(touched.timeline && errors.timeline))}>
                          <option value="">Select</option>
                          {TIMELINES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </Field>
                    </div>

                    <Field id="message" label="Anything else?" hint="Optional. Compliance deadlines, a past incident, languages your users speak.">
                      <textarea id="message" rows={3} value={values.message} onChange={(e) => update('message', e.target.value)} className={cn(fieldClass(false), 'min-h-[4.5rem] resize-y')} />
                    </Field>
                  </>
                )}

                {values.intent === 'other' && (
                  <Field id="message" label="Your message" error={touched.message ? errors.message : undefined}>
                    <textarea id="message" rows={4} value={values.message} onChange={(e) => update('message', e.target.value)} onBlur={() => onBlur('message')} className={cn(fieldClass(!!(touched.message && errors.message)), 'min-h-[7rem] resize-y')} placeholder="What can we help with?" />
                  </Field>
                )}

                {errors.message && !touched.message && <p className="text-caption text-destructive" role="alert">{errors.message}</p>}

                {values.intent !== 'join' && (
                  <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-caption text-muted-foreground">A person on the Oreset team will reply.</p>
                    <button type="submit" disabled={status === 'submitting'} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-body-sm font-semibold text-accent-foreground transition-[transform,background-color,opacity] duration-200 hover:-translate-y-0.5 hover:bg-copper-600 disabled:pointer-events-none disabled:opacity-60 sm:w-auto">
                      {status === 'submitting' ? 'Sending…' : 'Send it'}
                      {status !== 'submitting' && <ArrowRight className="size-4" aria-hidden="true" />}
                    </button>
                  </div>
                )}
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-body-sm font-medium text-foreground">{label}</label>
      {hint && <p className="mt-0.5 text-caption text-muted-foreground">{hint}</p>}
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1.5 text-caption text-destructive" role="alert">{error}</p>}
    </div>
  )
}

function fieldClass(invalid: boolean) {
  return cn(
    'w-full rounded-lg border bg-background px-3.5 py-2.5 text-body outline-none placeholder:text-muted-foreground/70 focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20',
    invalid ? 'border-destructive/50' : 'border-border',
  )
}
