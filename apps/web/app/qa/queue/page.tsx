import Link from 'next/link'
import { ArrowRight, CheckCircle2, TriangleAlert } from 'lucide-react'
import { QueueShell } from '@/components/shared/queue-shell'
import { cn } from '@/lib/utils'
import { serverApiFetch } from '@/lib/api/server'
import type { QaQueueItem } from '@/lib/api/endpoints/qa'

export default async function QaQueuePage() {
  const { items } = await serverApiFetch<{ items: QaQueueItem[] }>('/api/v1/qa/queue')

  return (
    <QueueShell badge="Origin QA" signOutHref="/qa" step={0}>
      <div className="card-surface-raised p-8 sm:p-10">
        <p className="text-eyebrow text-accent">Origin QA</p>
        <h1 className="text-h2 mt-2 text-balance text-foreground">
          {items.length} submission{items.length === 1 ? '' : 's'} awaiting manual review
        </h1>
        <p className="text-body mt-3 text-pretty text-muted-foreground">
          These passed Automated Validation. Approve for packaging, or reject with a standardized
          defect tag.
        </p>

        {items.length === 0 ? (
          <p className="mt-6 text-body-sm text-muted-foreground">Queue is empty — nothing awaiting review.</p>
        ) : (
          <>
            <ul className="mt-6 divide-y divide-border/70 border-y border-border/70">
              {items.map((item) => {
                const flagged = item.latestValidation?.outcome === 'fail'
                return (
                  <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex size-8 items-center justify-center rounded-full',
                          flagged ? 'bg-warning/10' : 'bg-success/10',
                        )}
                      >
                        {flagged ? (
                          <TriangleAlert className="size-4 text-warning" />
                        ) : (
                          <CheckCircle2 className="size-4 text-success" />
                        )}
                      </span>
                      <div>
                        <p className="text-body-sm font-medium text-foreground">{item.batch.title}</p>
                        <p className="text-caption text-muted-foreground">
                          {item.mediaType} · {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <Link
              href="/qa/item"
              className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 sm:w-auto"
            >
              Start reviewing
              <ArrowRight className="size-4" />
            </Link>
          </>
        )}
      </div>
    </QueueShell>
  )
}
