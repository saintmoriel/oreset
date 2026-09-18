'use client'

import { Suspense, useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, MailCheck } from 'lucide-react'
import { forgotPassword } from '@/lib/api/endpoints/auth'
import { ApiError } from '@/lib/api/client'
import { toast } from '@/components/ui/toast'

const PORTALS: Record<string, { label: string; signIn: string }> = {
  buyer: { label: 'Client portal', signIn: '/buyer' },
  operator: { label: 'Red team', signIn: '/operator' },
  admin: { label: 'Staff', signIn: '/admin' },
}

function ForgotPasswordContent() {
  const params = useSearchParams()
  const portal = PORTALS[params.get('portal') ?? ''] ?? null
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setStatus('submitting')
    try {
      await forgotPassword(email)
      setStatus('sent')
      toast.success('Check your email', 'If an account exists for that address, a reset link is on its way.')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not send the reset link. Try again.'
      setError(message)
      setStatus('idle')
      toast.error('Not sent', message)
    }
  }

  return (
    <div className="min-h-svh overflow-y-auto bg-background">
      <header className="border-b border-border/70 bg-card/80 backdrop-blur-md">
        <div className="container-narrow flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Oreset home">
            <span className="flex size-8 overflow-hidden rounded-md bg-paper-200">
              <Image src="/oreset-logo.png" alt="" width={32} height={32} className="size-8" />
            </span>
            <span className="font-display text-lg font-semibold tracking-display">Oreset</span>
          </Link>
          <Link href={portal?.signIn ?? '/'} className="inline-flex items-center gap-1.5 text-body-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            {portal ? 'Back to sign-in' : 'Back to site'}
          </Link>
        </div>
      </header>

      <main className="container-narrow py-16 sm:py-24">
        <div className="cx-card p-8 sm:p-10">
          <p className="cx-label text-accent">{portal?.label ?? 'Oreset'}</p>
          <h1 className="cx-page-title mt-2 text-navy-900">Reset your password</h1>

          {status === 'sent' ? (
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-success/30 bg-success/5 p-4">
              <MailCheck className="mt-0.5 size-5 shrink-0 text-success" />
              <div>
                <p className="cx-body font-semibold text-navy-900">If an account exists for {email}, a reset link is on its way.</p>
                <p className="cx-meta mt-1 text-navy-500">The link works for 30 minutes. Check spam if it does not arrive within a few minutes.</p>
                {portal && (
                  <Link href={portal.signIn} className="mt-3 inline-block cx-meta font-semibold text-accent hover:text-copper-600">Back to sign-in</Link>
                )}
              </div>
            </div>
          ) : (
            <>
              <p className="cx-body mt-3 text-navy-500">
                Enter the email on your account. We will send a link to choose a new password.
              </p>
              <form onSubmit={onSubmit} className="mt-8 space-y-4">
                <div>
                  <label className="cx-meta font-medium text-navy-800">Email</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yourcompany.com"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-body outline-none placeholder:text-muted-foreground/70 focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20"
                  />
                </div>
                {error && <p className="cx-meta text-destructive" role="alert">{error}</p>}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:opacity-60"
                >
                  {status === 'submitting' ? 'Sending…' : 'Send reset link'}
                  {status !== 'submitting' && <ArrowRight className="size-4" />}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordContent />
    </Suspense>
  )
}
