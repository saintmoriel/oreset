'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, Megaphone } from 'lucide-react'
import { useCampaignDraft } from '@/components/admin/campaign-context'

export default function NewCampaignNamePage() {
  const router = useRouter()
  const { draft, update } = useCampaignDraft()

  return (
    <div className="card-surface-raised p-8 sm:p-10">
      <span className="flex size-12 items-center justify-center rounded-xl bg-accent/10">
        <Megaphone className="size-6 text-accent" />
      </span>
      <p className="text-eyebrow mt-5 text-accent">Step 1</p>
      <h1 className="text-h2 mt-2 text-balance text-foreground">New campaign</h1>
      <p className="text-body mt-3 text-pretty text-muted-foreground">
        Give this campaign a name your team will recognize in reports and payouts.
      </p>

      <div className="mt-6">
        <label className="text-body-sm font-medium text-foreground">Campaign name</label>
        <input
          value={draft.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="e.g. CLEAR Global Hausa Pilot — 100 Prompts"
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-body outline-none placeholder:text-muted-foreground/70 focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20"
        />
      </div>

      <button
        disabled={!draft.name.trim()}
        onClick={() => router.push('/admin/campaigns/new/parameters')}
        className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        Continue
        <ArrowRight className="size-4" />
      </button>
    </div>
  )
}
