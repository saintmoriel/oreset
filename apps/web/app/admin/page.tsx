'use client'

import { Suspense, useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import { login, verifyMfa } from '@/lib/api/endpoints/auth'
import { describeError } from '@/lib/api/client'
import { toast } from '@/components/ui/toast'

const INPUT =
  'mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-body outline-none placeholder:text-muted-foreground/70 focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20'

function AdminSignInContent() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaToken, setMfaToken] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function go(displayName: string | null) {
    toast.success('Signed in', `Welcome back${displayName ? `, ${displayName}` : ''}.`)
    // Full navigation, not the client router: the router may have prefetched
    // the destination while signed out and cached its redirect to sign-in.
    window.location.assign(next ?? '/admin/home')
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const result = await login(email, password)
      if (result.mfaRequired) {
        setMfaToken(result.mfaToken)
        toast.success('Password accepted', 'Now enter the code from your authenticator app.')
        return
      }
      go(result.user.displayName)
    } catch (err) {
      const message = describeError(err, 'Sign-in failed. Try again.')
      setError(message)
      toast.error('Sign-in failed', message)
    } finally {
      setSubmitting(false)
    }
  }

  async function onSubmitCode(e: FormEvent) {
    e.preventDefault()
    if (!mfaToken) return
    setError(null)
    setSubmitting(true)
    try {
      const result = await verifyMfa(mfaToken, code)
      go(result.user.displayName)
    } catch (err) {
      const message = describeError(err, 'That code did not work.')
      setError(message)
      toast.error('Code not accepted', message)
      if (message.toLowerCase().includes('expired')) {
        setMfaToken(null)
        setCode('')
      }
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
          <Link href="/" className="inline-flex items-center gap-1.5 text-body-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            Back to site
          </Link>
        </div>
      </header>

      <main className="container-narrow py-16 sm:py-24">
        <div className="cx-card p-8 sm:p-10">
          <p className="cx-label text-accent">Oreset staff</p>
          <h1 className="cx-page-title mt-2 text-navy-900">{mfaToken ? 'Enter your code' : 'Staff sign-in'}</h1>
          <p className="cx-body mt-3 text-navy-500">
            {mfaToken
              ? 'Open your authenticator app and type the six-digit code for Oreset. A recovery code works too.'
              : 'Owner, lead auditors, engineers, sales and compliance. What you see is set by your role and the modules granted to you.'}
          </p>

          {mfaToken ? (
            <form onSubmit={onSubmitCode} className="mt-8 space-y-4">
              <div>
                <label className="cx-meta font-medium text-navy-800">Six-digit code</label>
                <input
                  required
                  autoFocus
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123 456"
                  className={`${INPUT} font-mono text-lg tracking-widest`}
                />
              </div>
              {error && <p className="cx-meta text-destructive" role="alert">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:opacity-60"
              >
                {submitting ? 'Checking…' : 'Continue'}
                {!submitting && <ShieldCheck className="size-4" />}
              </button>
              <button type="button" onClick={() => { setMfaToken(null); setCode(''); setError(null) }} className="cx-meta w-full text-center font-medium text-navy-500 hover:text-accent">
                Start over
              </button>
            </form>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <div>
                <label className="cx-meta font-medium text-navy-800">Email</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@oreset.africa" className={INPUT} />
              </div>
              <div>
                <label className="cx-meta font-medium text-navy-800">Password</label>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={INPUT} />
              </div>
              <div className="flex justify-end">
                <Link href="/forgot-password?portal=admin" className="cx-meta font-medium text-navy-500 hover:text-accent">Forgot password?</Link>
              </div>
              {error && <p className="cx-meta text-destructive" role="alert">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:opacity-60"
              >
                {submitting ? 'Signing in…' : 'Sign in'}
                {!submitting && <ArrowRight className="size-4" />}
              </button>
            </form>
          )}

          <p className="cx-meta mt-6 text-navy-400">
            One browser holds one Oreset session. To be signed in as two accounts at once, use a private window or a second browser for the other account.
          </p>
        </div>
      </main>
    </div>
  )
}

export default function AdminSignInPage() {
  return (
    <Suspense>
      <AdminSignInContent />
    </Suspense>
  )
}
