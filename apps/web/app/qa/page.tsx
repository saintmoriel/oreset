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
      router.push(next ?? '/qa/home')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign-in failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col overflow-y-auto bg-background">
      <header className="border-b border-border">
        <div className="container-narrow flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="Oreset home">
            <span className="flex size-6 overflow-hidden rounded">
              <Image src="/oreset-logo.png" alt="" width={24} height={24} className="size-6" />
            </span>
            <span className="cx-title text-navy-800">Oreset</span>
          </Link>
          <Link href="/" className="cx-meta inline-flex items-center gap-1.5 font-medium text-navy-500 hover:text-navy-800">
            <ArrowLeft className="size-3.5" />
            Back to site
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="cx-card w-full max-w-sm p-7">
          <span className="flex size-9 items-center justify-center rounded-md bg-accent/10">
            <ShieldCheck className="size-4 text-accent" />
          </span>
          <p className="cx-label mt-4 text-navy-400">Origin · Quality Assurance</p>
          <h1 className="cx-page-title mt-1.5 text-navy-900">Staff sign-in</h1>
          <p className="cx-body mt-2 text-navy-500">
            Manual review of Oreset&apos;s own collected data — everything here already passed
            Automated Validation and is awaiting sign-off before packaging.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="cx-meta font-medium text-navy-800">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@oreset.dev"
                className="mt-1.5 h-11 w-full rounded-md border border-border bg-background px-3.5 cx-body text-navy-900 outline-none placeholder:text-navy-300 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
              />
            </div>
            <div>
              <label className="cx-meta font-medium text-navy-800">Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-md border border-border bg-background px-3.5 cx-body text-navy-900 outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
              />
            </div>
            {error && (
              <p className="cx-meta text-destructive" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:opacity-60"
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
