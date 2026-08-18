'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import { CaptureShell } from '@/components/capture/capture-shell'
import { cn } from '@/lib/utils'

function ConsentContent() {
  const router = useRouter()
  const params = useSearchParams()
  const id = params.get('id') ?? ''
  const type = params.get('type') ?? 'audio'
  const [agreed, setAgreed] = useState(false)

  return (
    <CaptureShell step={0}>
      <div className="card-surface-raised p-8 sm:p-10">
        <span className="flex size-12 items-center justify-center rounded-xl bg-accent/10">
          <ShieldCheck className="size-6 text-accent" />
        </span>
        <p className="text-eyebrow mt-5 text-accent">Consent</p>
        <h1 className="text-h2 mt-2 text-balance text-foreground">Before you capture</h1>
        <p className="text-body mt-3 text-pretty text-muted-foreground">
          This is an explicit digital sign-off, time-stamped and permanently bound to this
          session — it cannot be altered after you continue. Signing locks your licensing rights
          into the Shared Trust Ledger before any capture happens.
        </p>

        <ul className="mt-6 space-y-3 border-t border-border/70 pt-5 text-body-sm text-muted-foreground">
          {[
            'Your submission is stored separately from your name and contact details',
            'Data is encrypted in transit and at rest',
            'Licensing rights are recorded on the Shared Trust Ledger at the moment of consent',
            'You may withdraw consent and request deletion at any time',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <span className="motif-dot mt-1.5 shrink-0" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <label
          className={cn(
            'mt-6 flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-body-sm transition-colors',
            agreed ? 'border-accent/50 bg-accent/5' : 'border-border',
          )}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 size-4 accent-accent"
          />
          <span className="text-foreground">
            I understand and explicitly consent to this submission being captured, licensed, and
            used as described.
          </span>
        </label>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            onClick={() => router.push(id ? `/capture/batch?id=${id}` : '/capture/batch')}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border px-6 text-sm font-semibold text-foreground hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <button
            disabled={!agreed}
            onClick={() => router.push(`/capture/task?id=${id}&type=${type}`)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Agree &amp; continue
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </CaptureShell>
  )
}

export default function ConsentPage() {
  return (
    <Suspense>
      <ConsentContent />
    </Suspense>
  )
}
