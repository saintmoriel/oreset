'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Rocket } from 'lucide-react'
import type { MediaType } from '@oreset/shared'
import { useCampaignDraft } from '@/components/admin/campaign-context'
import { createCampaign, type Campaign } from '@/lib/api/endpoints/campaigns'
import { ApiError } from '@/lib/api/client'

export default function CampaignLaunchPage() {
  const router = useRouter()
  const { draft, reset } = useCampaignDraft()
  const [launched, setLaunched] = useState<Campaign | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onLaunch() {
    setError(null)
    setSubmitting(true)
    try {
      const { campaign } = await createCampaign({
        title: draft.name,
        mediaType: draft.mediaType.toLowerCase() as MediaType,
        language: draft.language || undefined,
        domain: draft.domain || undefined,
        itemCount: Number(draft.batchSize),
        payRateMinorUnits: Math.round(Number(draft.payRate) * 100),
        cohort: draft.cohort || undefined,
        materials: { uploaded: draft.materialsUploaded },
      })
      setLaunched(campaign)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not launch this campaign. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (launched) {
    return (
      <div className="cx-card flex flex-col items-start gap-4 p-8 sm:p-10" role="status">
        <h1 className="cx-page-title text-navy-900">{launched.title} is live.</h1>
        <p className="cx-body text-pretty text-navy-400">
          This campaign is now visible in Contributors&apos; batch feed
          {launched.cohort ? (
            <>
              {' '}
              for the <strong className="font-semibold text-navy-900">{launched.cohort}</strong> cohort.
            </>
          ) : (
            '.'
          )}
        </p>
        <Link
          href="/admin/campaigns"
          onClick={reset}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600"
        >
          Back to Campaign Studio
        </Link>
      </div>
    )
  }

  return (
    <div className="cx-card p-8 sm:p-10">
      <p className="cx-label text-accent">Step 6</p>
      <h1 className="cx-page-title mt-2 text-balance text-navy-900">Review &amp; launch</h1>

      <dl className="mt-6 divide-y divide-border/70 border-y border-border">
        {[
          ['Name', draft.name || '—'],
          ['Language', draft.language || '—'],
          ['Domain', draft.domain || '—'],
          ['Batch size', draft.batchSize || '—'],
          ['Media type', draft.mediaType || '—'],
          ['Pay rate', draft.payRate ? `₦${draft.payRate} per item` : '—'],
          ['Reference materials', draft.materialsUploaded ? 'Attached' : 'None'],
          ['Cohort', draft.cohort || '—'],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between py-2.5 cx-meta">
            <dt className="text-navy-400">{label}</dt>
            <dd className="font-medium text-navy-900">{value}</dd>
          </div>
        ))}
      </dl>

      {error && (
        <p className="mt-4 cx-meta text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          onClick={() => router.push('/admin/campaigns/new/cohort')}
          disabled={submitting}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border px-6 text-sm font-semibold text-navy-900 hover:bg-navy-50 disabled:opacity-50"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <button
          onClick={onLaunch}
          disabled={submitting}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Rocket className="size-4" />
          {submitting ? 'Launching…' : 'Launch campaign'}
        </button>
      </div>
    </div>
  )
}
