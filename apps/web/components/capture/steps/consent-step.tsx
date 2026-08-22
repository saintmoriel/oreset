'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import { useCaptureSession } from '@/components/capture/capture-session-context'
import { recordConsent } from '@/lib/api/endpoints/consent'
import { ApiError } from '@/lib/api/client'
import { cn } from '@/lib/utils'

export function ConsentStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { session, update } = useCaptureSession()
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onContinue() {
    setError(null)
    setSubmitting(true)
    try {
      const { consentRecord } = await recordConsent(session.batchId ?? undefined)
      update({ consentRecordId: consentRecord.id })
      onNext()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not record consent. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <span className="flex size-10 items-center justify-center rounded-md bg-accent/10">
        <ShieldCheck className="size-5 text-accent" />
      </span>
      <p className="cx-label mt-6 text-navy-400">Consent</p>
      <h1 className="cx-page-title mt-2 text-navy-900">Before you capture</h1>
      <p className="cx-body mt-3 text-navy-500">
        This is an explicit digital sign-off, time-stamped and permanently bound to this
        session — it cannot be altered after you continue. Signing locks your licensing rights
        into the Shared Trust Ledger before any capture happens.
      </p>

      <ul className="mt-6 space-y-2.5 border-t border-border pt-5">
        {[
          'Your submission is stored separately from your name and contact details',
          'Data is encrypted in transit and at rest',
          'Licensing rights are recorded on the Shared Trust Ledger at the moment of consent',
          'You may withdraw consent and request deletion at any time',
        ].map((item) => (
          <li key={item} className="cx-body flex items-start gap-2.5 text-navy-500">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-navy-300" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>

      <label
        className={cn(
          'mt-6 flex cursor-pointer items-start gap-3 rounded-md border p-4 cx-fade',
          agreed ? 'border-accent bg-accent/5' : 'border-border',
        )}
      >
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 size-4 accent-accent"
        />
        <span className="cx-body text-navy-800">
          I understand and explicitly consent to this submission being captured, licensed, and
          used as described.
        </span>
      </label>

      {error && (
        <p className="mt-4 cx-meta text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          onClick={onBack}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border px-5 text-sm font-medium text-navy-800 hover:bg-navy-50"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <button
          disabled={!agreed || submitting}
          onClick={onContinue}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? 'Recording consent…' : 'Agree & continue'}
          {!submitting && <ArrowRight className="size-4" />}
        </button>
      </div>
    </div>
  )
}
