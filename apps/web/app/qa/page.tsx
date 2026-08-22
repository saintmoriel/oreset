'use client'

import { Suspense, useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import { login } from '@/lib/api/endpoints/auth'
import { ApiError } from '@/lib/api/client'

function QaSignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      router.push(next ?? '/qa/queue')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign-in failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border/70 bg-card/80 backdrop-blur-md">
        <div className="container-narrow flex h-16 items-center justify-between">
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

      <main className="container-narrow py-16 sm:py-24">
        <div className="card-surface-raised p-8 sm:p-10">
          <span className="flex size-12 items-center justify-center rounded-xl bg-accent/10">
            <ShieldCheck className="size-6 text-accent" />
          </span>
          <p className="text-eyebrow mt-5 text-accent">Origin · Quality Assurance</p>
          <h1 className="text-h1 mt-2 text-balance text-foreground">Staff sign-in</h1>
          <p className="text-body mt-3 text-pretty text-muted-foreground">
            Senior data-lead review of Oreset&apos;s own collected data — everything here already
            passed Automated Validation and is awaiting manual sign-off before packaging.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-body-sm font-medium text-foreground">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@oreset.dev"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-body outline-none placeholder:text-muted-foreground/70 focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20"
              />
            </div>
            <div>
              <label className="text-body-sm font-medium text-foreground">Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-body outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20"
              />
            </div>
            {error && (
              <p className="text-caption text-destructive" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Enter QA Queue'}
              {!submitting && <ArrowRight className="size-4" />}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default function QaSignInPage() {
  return (
    <Suspense>
      <QaSignInContent />
    </Suspense>
  )
}
