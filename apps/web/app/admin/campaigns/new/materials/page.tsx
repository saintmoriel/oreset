'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle2, Upload } from 'lucide-react'
import { useCampaignDraft } from '@/components/admin/campaign-context'
import { cn } from '@/lib/utils'

export default function CampaignMaterialsPage() {
  const router = useRouter()
  const { draft, update } = useCampaignDraft()

  return (
    <div className="cx-card p-8 sm:p-10">
      <p className="cx-label text-accent">Step 4</p>
      <h1 className="cx-page-title mt-2 text-balance text-navy-900">Upload reference materials</h1>
      <p className="cx-body mt-3 text-pretty text-navy-400">
        Scripts, prompt lists, or imagery templates contributors will work from.
      </p>

      <button
        onClick={() => update({ materialsUploaded: !draft.materialsUploaded })}
        className={cn(
          'mt-6 flex w-full flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center transition-colors',
          draft.materialsUploaded ? 'border-success/40 bg-success/5' : 'border-border hover:bg-navy-50',
        )}
      >
        {draft.materialsUploaded ? (
          <>
            <CheckCircle2 className="size-8 text-success" />
            <p className="cx-meta font-medium text-navy-900">reference-materials.zip attached</p>
            <p className="cx-meta text-navy-400">Click to remove</p>
          </>
        ) : (
          <>
            <Upload className="size-8 text-navy-400" />
            <p className="cx-meta font-medium text-navy-900">Click to attach files</p>
            <p className="cx-meta text-navy-400">Demo only — no real upload in this scaffold</p>
          </>
        )}
      </button>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          onClick={() => router.push('/admin/campaigns/new/pay-rate')}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border px-6 text-sm font-semibold text-navy-900 hover:bg-navy-50"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <button
          onClick={() => router.push('/admin/campaigns/new/cohort')}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600"
        >
          Continue
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
