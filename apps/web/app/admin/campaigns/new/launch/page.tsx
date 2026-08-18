'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, PartyPopper, Rocket } from 'lucide-react'
import { useCampaignDraft } from '@/components/admin/campaign-context'

export default function CampaignLaunchPage() {
  const router = useRouter()
  const { draft, reset } = useCampaignDraft()
  const [launched, setLaunched] = useState(false)

  if (launched) {
    return (
      <div className="card-surface-raised flex flex-col items-start gap-4 p-8 sm:p-10" role="status">
        <span className="flex size-12 items-center justify-center rounded-xl bg-success/10">
          <PartyPopper className="size-6 text-success" />
        </span>
        <h1 className="text-h2 text-foreground">{draft.name} is live.</h1>
        <p className="text-body text-pretty text-muted-foreground">
          This campaign is now visible in Contributors&apos; batch feed for the{' '}
          <strong className="font-semibold text-foreground">{draft.cohort}</strong> cohort.
        </p>
        <Link
          href="/admin/campaigns?role=admin"
          onClick={reset}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600"
        >
          Back to Campaign Studio
        </Link>
      </div>
    )
  }

  return (
    <div className="card-surface-raised p-8 sm:p-10">
      <span className="flex size-12 items-center justify-center rounded-xl bg-accent/10">
        <Rocket className="size-6 text-accent" />
      </span>
      <p className="text-eyebrow mt-5 text-accent">Step 6</p>
      <h1 className="text-h2 mt-2 text-balance text-foreground">Review &amp; launch</h1>

      <dl className="mt-6 divide-y divide-border/70 border-y border-border/70">
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
          <div key={label} className="flex items-center justify-between py-2.5 text-body-sm">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          onClick={() => router.push('/admin/campaigns/new/cohort')}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border px-6 text-sm font-semibold text-foreground hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <button
          onClick={() => setLaunched(true)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600"
        >
          <Rocket className="size-4" />
          Launch campaign
        </button>
      </div>
    </div>
  )
}
