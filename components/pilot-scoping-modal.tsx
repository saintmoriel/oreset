'use client'

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type FormState = {
  name: string
  email: string
  org: string
  domain: string
  language: string
  caseDescription: string
}

const initial: FormState = {
  name: '',
  email: '',
  org: '',
  domain: '',
  language: '',
  caseDescription: '',
}

const domains = ['Claims & payouts', 'Lending & credit', 'Government & public services', 'Other decision-driven AI']

export function openPilotModal() {
  window.dispatchEvent(new CustomEvent('oreset:open-pilot'))
}

export function PilotScopingModal() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [values, setValues] = useState<FormState>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const reduceMotion = useReducedMotion()
  const titleId = useId()
  const firstFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => setMounted(true), [])

  const close = useCallback(() => {
    setOpen(false)
    window.dispatchEvent(new CustomEvent('oreset:scroll-start'))
  }, [])

  useEffect(() => {
    const openHandler = () => {
      setOpen(true)
      setStatus('idle')
      window.dispatchEvent(new CustomEvent('oreset:scroll-stop'))
    }
    window.addEventListener('oreset:open-pilot', openHandler)
    return () => window.removeEventListener('oreset:open-pilot', openHandler)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 50)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      window.clearTimeout(t)
    }
  }, [open, close])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((v) => ({ ...v, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!values.name.trim()) next.name = 'Please enter your name.'
    if (!values.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = 'Enter a valid work email.'
    }
    if (!values.org.trim()) next.org = 'Organization helps us route the review.'
    if (!values.domain) next.domain = 'Select the decision type.'
    if (!values.language.trim()) next.language = 'Which language or dialect is involved?'
    if (!values.caseDescription.trim() || values.caseDescription.trim().length < 20) {
      next.caseDescription = 'Describe the real decision or exchange \u2014 a few sentences is enough.'
    }
    setErrors(next)
    if (Object.keys(next).length) return

    setStatus('submitting')
    await new Promise((r) => setTimeout(r, 700))
    setStatus('success')
  }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            aria-label="Close pilot scoping"
            onClick={close}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex max-h-[92svh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
              <div>
                <p className="text-eyebrow text-accent">Verification request</p>
                <h2 id={titleId} className="mt-1 font-display text-xl font-semibold tracking-tight">
                  Verify a Decision
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5 sm:px-6">
              {status === 'success' ? (
                <div className="flex flex-col items-start gap-3 py-4" role="status">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-success/10">
                    <CheckCircle2 className="size-5 text-success" />
                  </span>
                  <h3 className="text-h4 text-foreground">Case received.</h3>
                  <p className="text-body-sm text-muted-foreground">
                    Our reviewers will look at what you've sent and follow up within a few business
                    days with what we found.
                  </p>
                  <button
                    type="button"
                    onClick={close}
                    className="mt-2 text-body-sm font-semibold text-accent hover:text-copper-600"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Name" error={errors.name}>
                      <input
                        ref={firstFieldRef}
                        value={values.name}
                        onChange={(e) => update('name', e.target.value)}
                        className={fieldClass(Boolean(errors.name))}
                        autoComplete="name"
                        placeholder="Your name"
                      />
                    </Field>
                    <Field label="Work email" error={errors.email}>
                      <input
                        type="email"
                        value={values.email}
                        onChange={(e) => update('email', e.target.value)}
                        className={fieldClass(Boolean(errors.email))}
                        autoComplete="email"
                        placeholder="you@lab.com"
                      />
                    </Field>
                  </div>

                  <Field label="Organization" error={errors.org}>
                    <input
                      value={values.org}
                      onChange={(e) => update('org', e.target.value)}
                      className={fieldClass(Boolean(errors.org))}
                      autoComplete="organization"
                      placeholder="Lab, startup, or research group"
                    />
                  </Field>

                  <fieldset>
                    <legend className="text-body-sm font-medium text-foreground">
                      Decision type
                    </legend>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {domains.map((d) => (
                        <label
                          key={d}
                          className={cn(
                            'cursor-pointer rounded-lg border px-3 py-2.5 text-caption font-medium transition-colors',
                            values.domain === d
                              ? 'border-accent bg-copper-50 text-foreground'
                              : 'border-border text-muted-foreground hover:border-foreground/20',
                          )}
                        >
                          <input
                            type="radio"
                            name="domain"
                            className="sr-only"
                            checked={values.domain === d}
                            onChange={() => update('domain', d)}
                          />
                          {d}
                        </label>
                      ))}
                    </div>
                    {errors.domain && (
                      <p className="mt-1.5 text-caption text-destructive" role="alert">
                        {errors.domain}
                      </p>
                    )}
                  </fieldset>

                  <Field label="Language or dialect" error={errors.language}>
                    <input
                      value={values.language}
                      onChange={(e) => update('language', e.target.value)}
                      className={fieldClass(Boolean(errors.language))}
                      placeholder="e.g. Yorùbá, Hausa, Pidgin"
                    />
                  </Field>

                  <Field label="Describe the decision" error={errors.caseDescription}>
                    <textarea
                      value={values.caseDescription}
                      onChange={(e) => update('caseDescription', e.target.value)}
                      className={cn(fieldClass(Boolean(errors.caseDescription)), 'min-h-[6rem] resize-y')}
                      placeholder="What happened, and what decision did your AI make? A real example, in a few sentences."
                    />
                  </Field>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground transition-[background-color,opacity] hover:bg-copper-600 disabled:opacity-60"
                  >
                    {status === 'submitting' ? 'Sending…' : 'Submit pilot request'}
                    {status !== 'submitting' && <ArrowRight className="size-4" />}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
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
    'w-full rounded-lg border bg-background px-3.5 py-2.5 text-body text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70',
    'focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20',
    invalid ? 'border-destructive/50' : 'border-border',
  )
}