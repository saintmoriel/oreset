'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, PackageCheck, ShieldCheck, Trash2 } from 'lucide-react'
import {
  getUnassembledSubmissions,
  addDatasetItems,
  removeDatasetItem,
  sealDataset,
  handoffDataset,
  type DatasetWithRelations,
  type UnassembledSubmission,
  type Buyer,
} from '@/lib/api/endpoints/datasets'
import { ApiError } from '@/lib/api/client'
import { cn } from '@/lib/utils'

export function DatasetAssemblyClient({ dataset, buyers }: { dataset: DatasetWithRelations; buyers: Buyer[] }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  return (
    <div>
      <p className="text-eyebrow text-accent">{dataset.campaign.title}</p>
      <div className="mt-2 flex items-center gap-3">
        <h1 className="text-h2 text-foreground">{dataset.title}</h1>
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-caption font-semibold capitalize',
            dataset.status === 'draft' && 'bg-muted text-muted-foreground',
            dataset.status === 'sealed' && 'bg-warning/10 text-warning',
            dataset.status === 'delivered' && 'bg-success/10 text-success',
          )}
        >
          {dataset.status}
        </span>
      </div>
      <p className="text-body-sm mt-3 max-w-lg text-muted-foreground">{dataset.licenseTerms}</p>

      {error && (
        <p className="mt-4 text-caption text-destructive" role="alert">
          {error}
        </p>
      )}

      {dataset.status === 'draft' && (
        <DraftView dataset={dataset} onError={setError} onChange={() => router.refresh()} />
      )}
      {dataset.status === 'sealed' && (
        <SealedView dataset={dataset} buyers={buyers} onError={setError} onChange={() => router.refresh()} />
      )}
      {dataset.status === 'delivered' && <DeliveredView dataset={dataset} />}
    </div>
  )
}

function ItemsList({
  items,
  onRemove,
}: {
  items: DatasetWithRelations['items']
  onRemove?: (submissionId: string) => void
}) {
  if (items.length === 0) {
    return <p className="mt-4 text-body-sm text-muted-foreground">No items yet.</p>
  }
  return (
    <ul className="mt-4 divide-y divide-border/70 border-y border-border/70">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-4 py-3">
          <div>
            <p className="font-mono text-body-sm font-medium text-foreground">{item.submissionId}</p>
            <p className="text-caption text-muted-foreground">
              {item.submission.mediaType} · {item.submission.mimeType}
              {item.submission.durationSeconds ? ` · ${item.submission.durationSeconds}s` : ''}
            </p>
          </div>
          {onRemove && (
            <button
              onClick={() => onRemove(item.submissionId)}
              aria-label="Remove item"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}

function DraftView({
  dataset,
  onError,
  onChange,
}: {
  dataset: DatasetWithRelations
  onError: (msg: string | null) => void
  onChange: () => void
}) {
  const [pool, setPool] = useState<UnassembledSubmission[] | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [sealing, setSealing] = useState(false)

  useEffect(() => {
    getUnassembledSubmissions(dataset.id)
      .then((res) => setPool(res.submissions))
      .catch((err) => onError(err instanceof ApiError ? err.message : 'Could not load the pool.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset.id])

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function onAddSelected() {
    if (selected.size === 0) return
    setAdding(true)
    onError(null)
    try {
      await addDatasetItems(dataset.id, [...selected])
      setSelected(new Set())
      onChange()
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Could not add those items.')
    } finally {
      setAdding(false)
    }
  }

  async function onRemove(submissionId: string) {
    setRemoving(submissionId)
    onError(null)
    try {
      await removeDatasetItem(dataset.id, submissionId)
      onChange()
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Could not remove that item.')
    } finally {
      setRemoving(null)
    }
  }

  async function onSeal() {
    setSealing(true)
    onError(null)
    try {
      await sealDataset(dataset.id)
      onChange()
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Could not seal this dataset.')
      setSealing(false)
    }
  }

  return (
    <div>
      <h2 className="text-h4 mt-8 text-foreground">In this dataset ({dataset.items.length})</h2>
      <ItemsList items={dataset.items} onRemove={onRemove} />
      {removing && <p className="mt-2 text-caption text-muted-foreground">Removing…</p>}

      <h2 className="text-h4 mt-10 text-foreground">Available to add</h2>
      {!pool ? (
        <div className="mt-4 flex justify-center py-8">
          <Loader2 className="size-6 animate-spin text-accent" />
        </div>
      ) : pool.length === 0 ? (
        <p className="mt-4 text-body-sm text-muted-foreground">
          No qa_approved submissions in this campaign are currently unassembled.
        </p>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-border/70 border-y border-border/70">
            {pool.map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-3">
                <input
                  type="checkbox"
                  checked={selected.has(s.id)}
                  onChange={() => toggle(s.id)}
                  className="size-4 accent-accent"
                />
                <div className="flex-1">
                  <p className="font-mono text-body-sm font-medium text-foreground">{s.id}</p>
                  <p className="text-caption text-muted-foreground">
                    {s.contributor.displayName ?? 'Contributor'} · {s.mediaType} · {s.mimeType}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={onAddSelected}
            disabled={adding || selected.size === 0}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:opacity-60"
          >
            {adding && <Loader2 className="size-4 animate-spin" />}
            Add {selected.size > 0 ? selected.size : ''} to dataset
          </button>
        </>
      )}

      <div className="mt-10 border-t border-border/70 pt-6">
        <button
          onClick={onSeal}
          disabled={sealing || dataset.items.length === 0}
          className="inline-flex h-11 items-center gap-2 rounded-md bg-navy-800 px-5 text-sm font-semibold text-white hover:bg-navy-900 disabled:opacity-60"
        >
          {sealing ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
          Seal dataset
        </button>
        {dataset.items.length === 0 && (
          <p className="mt-2 text-caption text-muted-foreground">Add at least one item before sealing.</p>
        )}
      </div>
    </div>
  )
}

function SealedView({
  dataset,
  buyers,
  onError,
  onChange,
}: {
  dataset: DatasetWithRelations
  buyers: Buyer[]
  onError: (msg: string | null) => void
  onChange: () => void
}) {
  const [buyerId, setBuyerId] = useState(buyers[0]?.id ?? '')
  const [handingOff, setHandingOff] = useState(false)

  async function onHandoff() {
    if (!buyerId) return
    setHandingOff(true)
    onError(null)
    try {
      await handoffDataset(dataset.id, buyerId)
      onChange()
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Could not hand off this dataset.')
      setHandingOff(false)
    }
  }

  return (
    <div>
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 p-5">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />
        <div>
          <p className="text-body-sm font-semibold text-foreground">Provenance sealed</p>
          <p className="font-mono text-caption mt-1 break-all text-muted-foreground">{dataset.provenanceHash}</p>
        </div>
      </div>

      <h2 className="text-h4 mt-8 text-foreground">Manifest ({dataset.items.length})</h2>
      <ItemsList items={dataset.items} />

      <div className="mt-10 border-t border-border/70 pt-6">
        <p className="text-body-sm font-semibold text-foreground">Hand off to a buyer</p>
        {buyers.length === 0 ? (
          <p className="mt-2 text-body-sm text-muted-foreground">
            No buyer accounts exist yet — provision one first.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <select
              value={buyerId}
              onChange={(e) => setBuyerId(e.target.value)}
              className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-body-sm outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20"
            >
              {buyers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.displayName ?? b.email}
                </option>
              ))}
            </select>
            <button
              onClick={onHandoff}
              disabled={handingOff}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:opacity-60"
            >
              {handingOff ? <Loader2 className="size-4 animate-spin" /> : <PackageCheck className="size-4" />}
              Hand off
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function DeliveredView({ dataset }: { dataset: DatasetWithRelations }) {
  return (
    <div>
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 p-5">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
        <div>
          <p className="text-body-sm font-semibold text-foreground">
            Delivered to {dataset.buyer?.displayName ?? dataset.buyer?.email} on{' '}
            {dataset.deliveredAt ? new Date(dataset.deliveredAt).toLocaleDateString() : ''}
          </p>
          <p className="font-mono text-caption mt-1 break-all text-muted-foreground">{dataset.provenanceHash}</p>
        </div>
      </div>

      <h2 className="text-h4 mt-8 text-foreground">Manifest ({dataset.items.length})</h2>
      <ItemsList items={dataset.items} />
    </div>
  )
}
