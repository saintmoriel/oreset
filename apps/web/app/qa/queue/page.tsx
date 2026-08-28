import Link from 'next/link'
import { ArrowRight, TriangleAlert } from 'lucide-react'
import { QaAppShell } from '@/components/qa/qa-app-shell'
import { serverApiFetch, redirectIfSignedOut } from '@/lib/api/server'
import type { QaQueueItem } from '@/lib/api/endpoints/qa'

export default async function QaQueuePage() {
  let items: QaQueueItem[]
  try {
    ;({ items } = await serverApiFetch<{ items: QaQueueItem[] }>('/api/v1/qa/queue'))
  } catch (err) {
    redirectIfSignedOut(err, '/qa')
  }

  return (
    <QaAppShell>
      <p className="cx-label text-navy-400">Origin QA</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Queue</h1>
      <p className="cx-body mt-2 max-w-2xl text-navy-500">
        These passed Automated Validation. Approve for packaging, or reject with a standardized
        defect tag.
      </p>

      <div className="mt-6">
        <p className="cx-label text-navy-400">
          {items.length} submission{items.length === 1 ? '' : 's'} awaiting manual review
        </p>
        {items.length === 0 ? (
          <p className="cx-body mt-2.5 text-navy-400">Queue is empty — nothing awaiting review.</p>
        ) : (
          <>
            <div className="mt-2.5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const flagged = item.latestValidation?.outcome === 'fail'
                return (
                  <div key={item.id} className="cx-card flex flex-col gap-3 p-5">
                    <p className="cx-mono-meta font-semibold uppercase tracking-wider text-navy-400">
                      {item.mediaType}
                    </p>
                    <div>
                      <h2 className="cx-title text-navy-900">{item.batch.title}</h2>
                      <p className="cx-mono-meta mt-0.5 text-navy-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {flagged && (
                      <p className="flex items-center gap-1.5 cx-meta text-warning">
                        <TriangleAlert className="size-3.5 shrink-0" />
                        Automated Validation flagged this
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            <Link
              href="/qa/item"
              className="mt-6 inline-flex h-11 w-fit items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600"
            >
              Start reviewing
              <ArrowRight className="size-4" />
            </Link>
          </>
        )}
      </div>
    </QaAppShell>
  )
}
