'use client'

import { Suspense, useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { resetPassword } from '@/lib/api/endpoints/auth'
import { ApiError } from '@/lib/api/client'
import { toast } from '@/components/ui/toast'

function ResetPasswordContent() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mismatch = confirm.length > 0 && confirm !== password
  const tooShort = password.length > 0 && password.length < 8

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (mismatch || tooShort) return
    setError(null)
    setSubmitting(true)
    try {
      const { portalPath } = await resetPassword(token, password)
      toast.success('Password changed', 'Every other session was signed out. Sign in with your new password.')
      router.push(portalPath)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not reset the password. Try again.'
      setError(message)
      toast.error('Not changed', message)
    } finally {
      setSubmitting(false)
    }
  }

  const input = 'mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-body outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20'

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
          <Link href="/" className="inline-flex items-center gap-1.5 text-body-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            Back to site
          </Link>
        </div>
      </header>

      <main className="container-narrow py-16 sm:py-24">
        <div className="cx-card p-8 sm:p-10">
          <p className="cx-label text-accent">Oreset</p>
          <h1 className="cx-page-title mt-2 text-navy-900">Choose a new password</h1>

          {!token ? (
            <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="cx-body font-semibold text-navy-900">This link is missing its token.</p>
              <p className="cx-meta mt-1 text-navy-500">Open the link from your email again, or <Link href="/forgot-password" className="font-semibold text-accent">request a new one</Link>.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <div>
                <label className="cx-meta font-medium text-navy-800">New password</label>
                <input required type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
                {tooShort && <p className="cx-meta mt-1 text-destructive">At least 8 characters.</p>}
              </div>
              <div>
                <label className="cx-meta font-medium text-navy-800">Confirm new password</label>
                <input required type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} />
                {mismatch && <p className="cx-meta mt-1 text-destructive">Passwords do not match.</p>}
              </div>
              {error && (
                <p className="cx-meta text-destructive" role="alert">
                  {error} <Link href="/forgot-password" className="font-semibold underline">Request a new link</Link>.
                </p>
              )}
              <button
                type="submit"
                disabled={submitting || mismatch || tooShort || !password}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:opacity-60"
              >
                {submitting ? 'Saving…' : 'Set new password'}
                {!submitting && <ArrowRight className="size-4" />}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  )
}
