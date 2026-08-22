import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { serverApiFetch } from '@/lib/api/server'
import { CaptureAppShell } from '@/components/capture/capture-app-shell'
import { ResumeBanner } from '@/components/capture/resume-banner'
import { formatRate } from '@/lib/capture-format'
import type { Batch } from '@/lib/api/endpoints/batches'
import type { SubmissionSummary } from '@/lib/api/endpoints/submissions'

function computeCompletedBatches(submissions: SubmissionSummary[]) {
  const byBatch = new Map<string, { batch: SubmissionSummary['batch']; count: number }>()
  for (const s of submissions) {
    const entry = byBatch.get(s.batch.id) ?? { batch: s.batch, count: 0 }
    entry.count += 1
    byBatch.set(s.batch.id, entry)
  }
  return Array.from(byBatch.values()).filter((e) => e.count >= e.batch.itemCount)
}

export default async function CaptureBatchesPage() {
  const [{ batches: availableBatches }, { submissions }] = await Promise.all([
    serverApiFetch<{ batches: Batch[] }>('/api/v1/batches'),
    serverApiFetch<{ submissions: SubmissionSummary[] }>('/api/v1/submissions/me'),
  ])
  const completedBatches = computeCompletedBatches(submissions)

  return (
    <CaptureAppShell active="batches">
      <p className="cx-label text-navy-400">Work</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Batches</h1>

      <div className="mt-6">
        <ResumeBanner batches={availableBatches} />
      </div>

      <div>
        <p className="cx-label text-navy-400">{availableBatches.length} available</p>
        {availableBatches.length === 0 ? (
          <p className="cx-body mt-2.5 text-navy-400">No batches available right now — check back soon.</p>
        ) : (
          <div className="mt-2.5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availableBatches.map((batch) => {
              const tags = [batch.campaign?.language, batch.campaign?.domain].filter(Boolean) as string[]
              const earn = formatRate(batch.rateMinorUnits * batch.itemCount, batch.currency)
              return (
                <Link
                  key={batch.id}
                  href={`/capture/batches/${batch.id}`}
                  className="cx-card flex flex-col gap-3 p-5 hover:border-accent/40"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="cx-title text-navy-900">{batch.title}</h2>
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="cx-meta rounded-full border border-border px-2 py-0.5 font-medium text-navy-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="cx-meta mt-0.5 text-navy-400">
                      {batch.itemCount} items · earn {earn}
                    </p>
                    {batch.requiredPermissions && batch.requiredPermissions.length > 0 && (
                      <p className="cx-meta mt-1 text-navy-400">
                        Requires: {batch.requiredPermissions.join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex w-fit items-center gap-1.5 cx-meta font-semibold text-accent">
                    View &amp; start
                    <ArrowRight className="size-3.5" />
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-8">
        <p className="cx-label text-navy-400">Completed</p>
        {completedBatches.length === 0 ? (
          <p className="cx-body mt-2.5 text-navy-400">No fully completed batches yet.</p>
        ) : (
          <div className="cx-card mt-2.5 divide-y divide-border">
            {completedBatches.map(({ batch, count }) => (
              <Link
                key={batch.id}
                href={`/capture/batches/${batch.id}`}
                className="flex items-center justify-between gap-4 p-4 hover:bg-navy-50"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-4 shrink-0 text-success" />
                  <p className="cx-body font-medium text-navy-900">{batch.title}</p>
                </div>
                <span className="cx-meta text-navy-400">
                  {count} / {batch.itemCount} items
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </CaptureAppShell>
  )
}
