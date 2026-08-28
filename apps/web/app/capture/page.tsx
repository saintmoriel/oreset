'use client'

import { Suspense, useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Mic } from 'lucide-react'
import { requestOtp, verifyOtp } from '@/lib/api/endpoints/auth'
import { ApiError } from '@/lib/api/client'
import { VoidMark } from '@/components/capture/verification-seal'

function CaptureSignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next')

  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [devCode, setDevCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onRequestOtp(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const result = await requestOtp(phone)
      setDevCode(result.devCode ?? null)
      setStep('otp')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send a code. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function onVerifyOtp(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await verifyOtp(phone, code)
      router.push(next ?? '/capture/home')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That code didn’t work. Try again.')
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
            <Mic className="size-4 text-accent" />
          </span>
          <p className="cx-label mt-4 text-navy-400">Field Capture</p>
          <h1 className="cx-page-title mt-1.5 text-navy-900">Contributor sign-in</h1>

          {step === 'phone' ? (
            <>
              <p className="cx-body mt-2 text-navy-500">
                Enter the phone number you registered with. We&apos;ll text you a one-time code.
              </p>
              <form onSubmit={onRequestOtp} className="mt-6 space-y-4">
                <div>
                  <label className="cx-meta font-medium text-navy-800">Phone number</label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 8XX XXX XXXX"
                    className="mt-1.5 h-11 w-full rounded-md border border-border bg-background px-3.5 cx-body text-navy-900 outline-none placeholder:text-navy-300 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
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
                  {submitting ? 'Sending…' : 'Send code'}
                  {!submitting && <ArrowRight className="size-4" />}
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="cx-body mt-2 text-navy-500">Enter the 6-digit code sent to {phone}.</p>
              {devCode && (
                <div className="mt-3 flex items-center justify-between gap-2 rounded-md border border-warning/30 bg-warning/5 px-3 py-2">
                  <VoidMark label="Dev mode — not a real code" />
                  <span className="cx-body font-mono font-semibold tracking-[0.2em] text-navy-800">{devCode}</span>
                </div>
              )}
              <form onSubmit={onVerifyOtp} className="mt-5 space-y-4">
                <div>
                  <label className="cx-meta font-medium text-navy-800">6-digit code</label>
                  <input
                    required
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="mt-1.5 h-11 w-full rounded-md border border-border bg-background px-3.5 cx-body tracking-[0.3em] text-navy-900 outline-none placeholder:text-navy-300 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
                  />
                </div>
                {error && (
                  <p className="cx-meta text-destructive" role="alert">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting || code.length !== 6}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Verifying…' : 'Verify & continue'}
                  {!submitting && <ArrowRight className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone')
                    setError(null)
                  }}
                  className="w-full cx-meta font-medium text-navy-400 hover:text-navy-800"
                >
                  Use a different number
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default function CaptureSignInPage() {
  return (
    <Suspense>
      <CaptureSignInContent />
    </Suspense>
  )
}
