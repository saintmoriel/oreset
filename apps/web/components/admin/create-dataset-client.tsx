'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { createDataset } from '@/lib/api/endpoints/datasets'
import { ApiError } from '@/lib/api/client'
import type { Campaign } from '@/lib/api/endpoints/campaigns'

export function CreateDatasetClient({ campaigns }: { campaigns: Campaign[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id ?? '')
  const [licenseTerms, setLicenseTerms] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const { dataset } = await createDataset({ title, campaignId, licenseTerms })
      router.push(`/admin/datasets/${dataset.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create that dataset.')
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-copper-600"
      >
        <Plus className="size-4" />
        New Dataset
      </button>
    )
  }

  return (
    <form onSubmit={onSubmit} className="card-surface-raised space-y-4 p-6">
      <div>
        <label className="text-body-sm font-medium text-foreground">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Yorùbá Read-Speech — Delivery 1"
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-body-sm outline-none placeholder:text-muted-foreground/70 focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20"
        />
      </div>
      <div>
        <label className="text-body-sm font-medium text-foreground">Campaign</label>
        <select
          required
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-body-sm outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20"
        >
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-body-sm font-medium text-foreground">License terms</label>
        <textarea
          required
          value={licenseTerms}
          onChange={(e) => setLicenseTerms(e.target.value)}
          rows={3}
          placeholder="Non-exclusive, perpetual, for model training use only."
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-body-sm outline-none placeholder:text-muted-foreground/70 focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20"
        />
      </div>
      {error && (
        <p className="text-caption text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting || !campaignId}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:opacity-60"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Create draft
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={submitting}
          className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
