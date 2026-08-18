'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useCampaignDraft } from '@/components/admin/campaign-context'
import { CAMPAIGN_DOMAINS, CAMPAIGN_LANGUAGES, CAMPAIGN_MEDIA_TYPES } from '@/lib/admin-mock-data'
import { cn } from '@/lib/utils'

export default function CampaignParametersPage() {
  const router = useRouter()
  const { draft, update } = useCampaignDraft()

  const canContinue = draft.language && draft.domain && draft.batchSize && draft.mediaType

  return (
    <div className="card-surface-raised p-8 sm:p-10">
      <p className="text-eyebrow text-accent">Step 2</p>
      <h1 className="text-h2 mt-2 text-balance text-foreground">Define parameters</h1>
      <p className="text-body mt-3 text-pretty text-muted-foreground">
        Target language, domain, and batch specs for this campaign.
      </p>

      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-body-sm font-medium text-foreground">Target language</label>
            <select
              value={draft.language}
              onChange={(e) => update({ language: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-body outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20"
            >
              <option value="">Select a language</option>
              {CAMPAIGN_LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-body-sm font-medium text-foreground">Domain</label>
            <select
              value={draft.domain}
              onChange={(e) => update({ domain: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-body outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20"
            >
              <option value="">Select a domain</option>
              {CAMPAIGN_DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-body-sm font-medium text-foreground">Batch size (items)</label>
          <input
            type="number"
            min={1}
            value={draft.batchSize}
            onChange={(e) => update({ batchSize: e.target.value })}
            placeholder="e.g. 100"
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-body outline-none placeholder:text-muted-foreground/70 focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20"
          />
        </div>

        <div>
          <label className="text-body-sm font-medium text-foreground">Media type</label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {CAMPAIGN_MEDIA_TYPES.map((mt) => (
              <label
                key={mt}
                className={cn(
                  'flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 text-body-sm transition-colors',
                  draft.mediaType === mt ? 'border-accent/50 bg-accent/5' : 'border-border',
                )}
              >
                <input
                  type="radio"
                  name="mediaType"
                  checked={draft.mediaType === mt}
                  onChange={() => update({ mediaType: mt })}
                  className="size-4 accent-accent"
                />
                <span className="text-foreground">{mt}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          onClick={() => router.push('/admin/campaigns/new')}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border px-6 text-sm font-semibold text-foreground hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <button
          disabled={!canContinue}
          onClick={() => router.push('/admin/campaigns/new/pay-rate')}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
