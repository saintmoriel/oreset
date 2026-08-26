'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Audience = 'origin-buyer' | 'operators-buyer' | 'contributor' | ''

type FormState = {
  name: string
  email: string
  audience: Audience
  message: string
}

type FieldErrors = Partial<Record<keyof FormState, string>>

const initial: FormState = {
  name: '',
  email: '',
  audience: '',
  message: '',
}

const audiences: { value: Exclude<Audience, ''>; label: string; hint: string }[] = [
  {
    value: 'origin-buyer',
    label: 'Commission data',
    hint: 'Origin: speech, language, agri imagery',
  },
  {
    value: 'operators-buyer',
    label: 'Hire operators',
    hint: 'Certified native-language QA',
  },
  {
    value: 'contributor',
    label: 'Contribute / collect',
    hint: 'Language expert or field collector',
  },
]

function validate(values: FormState): FieldErrors {
  const errors: FieldErrors = {}
  if (!values.name.trim()) errors.name = 'Please enter your name.'
  if (!values.email.trim()) {
    errors.email = 'Please enter your email.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'That email doesn’t look right.'
  }
  if (!values.audience) errors.audience = 'Choose how you’d like to engage.'
  if (!values.message.trim() || values.message.trim().length < 12) {
    errors.message = 'A short note helps us route you to the right conversation.'
  }
  return errors
}

export function Contact() {
  const reduceMotion = useReducedMotion()
  const [values, setValues] = useState<FormState>(initial)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((v) => ({ ...v, [key]: value }))
    if (touched[key]) {
      setErrors((e) => {
        const next = { ...e }
        const fieldError = validate({ ...values, [key]: value })[key]
        if (fieldError) next[key] = fieldError
        else delete next[key]
        return next
      })
    }
  }

  function onBlur(key: keyof FormState) {
    setTouched((t) => ({ ...t, [key]: true }))
    const fieldError = validate(values)[key]
    setErrors((e) => {
      const next = { ...e }
      if (fieldError) next[key] = fieldError
      else delete next[key]
      return next
    })
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    setTouched({ name: true, email: true, audience: true, message: true })
    if (Object.keys(nextErrors).length) return

    setStatus('submitting')
    await new Promise((r) => setTimeout(r, 700))
    setStatus('success')
  }

  return (
    <section id="contact" className="relative overflow-hidden border-t border-border/60 py-16 sm:py-24 md:py-32 lg:py-40">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary/50 via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="container-wide relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <motion.p
              className="text-eyebrow text-accent"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              Get involved
            </motion.p>
            <motion.h2
              className="text-h1 mt-4 text-balance text-foreground"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              Start a pilot with Oreset.
            </motion.h2>
            <motion.p
              className="text-body-lg mt-5 text-pretty text-muted-foreground"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              Commission data, hire certified operators, or join as a collector / language
              expert. We’ll follow up personally. No automated drip.
            </motion.p>
            <p className="mt-8 text-body-sm text-muted-foreground">
              Or email{' '}
              <a
                href="mailto:hello@oreset.africa"
                className="font-medium text-accent underline-offset-4 hover:underline"
              >
                hello@oreset.africa
              </a>
            </p>
          </div>

          <motion.div
            className="lg:col-span-7"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {status === 'success' ? (
              <div
                className="card-surface-raised flex flex-col items-start gap-4 p-8 md:p-10"
                role="status"
                aria-live="polite"
              >
                <span className="flex size-12 items-center justify-center rounded-xl bg-success/10">
                  <CheckCircle2 className="size-6 text-success" aria-hidden="true" />
                </span>
                <h3 className="text-h3 text-foreground">Received. Thank you.</h3>
                <p className="text-body text-muted-foreground">
                  We’ll read your note and reply within a few business days. If your timeline
                  is tight, email us directly and flag it.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStatus('idle')
                    setValues(initial)
                    setErrors({})
                    setTouched({})
                  }}
                  className="mt-2 text-body-sm font-semibold text-accent hover:text-copper-600"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                noValidate
                className="card-surface-raised space-y-5 p-6 md:p-8"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="name" label="Name" error={touched.name ? errors.name : undefined}>
                    <input
                      id="name"
                      name="name"
                      autoComplete="name"
                      value={values.name}
                      onChange={(e) => update('name', e.target.value)}
                      onBlur={() => onBlur('name')}
                      aria-invalid={Boolean(touched.name && errors.name)}
                      className={fieldClass(Boolean(touched.name && errors.name))}
                      placeholder="Your name"
                    />
                  </Field>
                  <Field id="email" label="Email" error={touched.email ? errors.email : undefined}>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={values.email}
                      onChange={(e) => update('email', e.target.value)}
                      onBlur={() => onBlur('email')}
                      aria-invalid={Boolean(touched.email && errors.email)}
                      className={fieldClass(Boolean(touched.email && errors.email))}
                      placeholder="you@organization.com"
                    />
                  </Field>
                </div>

                <fieldset>
                  <legend className="text-body-sm font-medium text-foreground">
                    How do you want to engage?
                  </legend>
                  <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    {audiences.map((opt) => (
                      <label
                        key={opt.value}
                        className={cn(
                          'cursor-pointer rounded-lg border px-3.5 py-3 transition-colors',
                          values.audience === opt.value
                            ? 'border-accent bg-copper-50 text-foreground'
                            : 'border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground',
                        )}
                      >
                        <input
                          type="radio"
                          name="audience"
                          value={opt.value}
                          checked={values.audience === opt.value}
                          onChange={() => update('audience', opt.value)}
                          onBlur={() => onBlur('audience')}
                          className="sr-only"
                        />
                        <span className="block text-body-sm font-semibold text-foreground">
                          {opt.label}
                        </span>
                        <span className="mt-1 block text-caption opacity-80">{opt.hint}</span>
                      </label>
                    ))}
                  </div>
                  {touched.audience && errors.audience && (
                    <p className="mt-2 text-caption text-destructive" role="alert">
                      {errors.audience}
                    </p>
                  )}
                </fieldset>

                <Field
                  id="message"
                  label="Tell us about the pilot"
                  error={touched.message ? errors.message : undefined}
                >
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={values.message}
                    onChange={(e) => update('message', e.target.value)}
                    onBlur={() => onBlur('message')}
                    aria-invalid={Boolean(touched.message && errors.message)}
                    className={cn(
                      fieldClass(Boolean(touched.message && errors.message)),
                      'min-h-[7rem] resize-y',
                    )}
                    placeholder="What decision, what language, and what you're trying to verify…"
                  />
                </Field>

                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-caption text-muted-foreground">
                    A person on the Oreset team will reply.
                  </p>
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-body-sm font-semibold text-accent-foreground transition-[transform,background-color,opacity] duration-200 hover:-translate-y-0.5 hover:bg-copper-600 disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
                  >
                    {status === 'submitting' ? 'Sending…' : 'Start a pilot'}
                    {status !== 'submitting' && (
                      <ArrowRight className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="text-body-sm font-medium text-foreground">
        {label}
      </label>
      <div className="mt-2">{children}</div>
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
    invalid
      ? 'border-destructive/50 focus-visible:border-destructive focus-visible:ring-destructive/15'
      : 'border-border',
  )
}