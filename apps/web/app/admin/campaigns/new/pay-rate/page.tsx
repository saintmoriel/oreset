'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Wallet } from 'lucide-react'
import { useCampaignDraft } from '@/components/admin/campaign-context'

export default function CampaignPayRatePage() {
  const router = useRouter()
  const { draft, update } = useCampaignDraft()

  return (
    <div className="card-surface-raised p-8 sm:p-10">
      <span className="flex size-12 items-center justify-center rounded-xl bg-accent/10">
        <Wallet className="size-6 text-accent" />
      </span>
      <p className="text-eyebrow mt-5 text-accent">Step 3</p>
      <h1 className="text-h2 mt-2 text-balance text-foreground">Set pay rate</h1>
      <p className="text-body mt-3 text-pretty text-muted-foreground">
        Contributor compensation per approved item in this campaign.
      </p>

      <div className="mt-6">
        <label className="text-body-sm font-medium text-foreground">Rate per item (₦)</label>
        <input
          type="number"
          min={0}
          value={draft.payRate}
          onChange={(e) => update({ payRate: e.target.value })}
          placeholder="e.g. 2500"
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-body outline-none placeholder:text-muted-foreground/70 focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20"
        />
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          onClick={() => router.push('/admin/campaigns/new/parameters')}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border px-6 text-sm font-semibold text-foreground hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <button
          disabled={!draft.payRate}
          onClick={() => router.push('/admin/campaigns/new/materials')}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
