'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useCampaignDraft } from '@/components/admin/campaign-context'
import { CAMPAIGN_COHORTS } from '@/lib/admin-mock-data'
import { cn } from '@/lib/utils'

export default function CampaignCohortPage() {
  const router = useRouter()
  const { draft, update } = useCampaignDraft()

  return (
    <div className="cx-card p-8 sm:p-10">
      <p className="cx-label text-accent">Step 5</p>
      <h1 className="cx-page-title mt-2 text-balance text-navy-900">Assign cohort</h1>
      <p className="cx-body mt-3 text-pretty text-navy-400">
        Which applicant pool should this campaign draw contributors from?
      </p>

      <div className="mt-6 space-y-2">
        {CAMPAIGN_COHORTS.map((cohort) => (
          <label
            key={cohort}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 cx-meta transition-colors',
              draft.cohort === cohort ? 'border-accent/50 bg-accent/5' : 'border-border',
            )}
          >
            <input
              type="radio"
              name="cohort"
              checked={draft.cohort === cohort}
              onChange={() => update({ cohort })}
              className="size-4 accent-accent"
            />
            <span className="text-navy-900">{cohort}</span>
          </label>
        ))}
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          onClick={() => router.push('/admin/campaigns/new/materials')}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border px-6 text-sm font-semibold text-navy-900 hover:bg-navy-50"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <button
          disabled={!draft.cohort}
          onClick={() => router.push('/admin/campaigns/new/launch')}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
