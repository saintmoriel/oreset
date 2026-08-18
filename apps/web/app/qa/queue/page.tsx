'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2, TriangleAlert } from 'lucide-react'
import { QueueShell } from '@/components/shared/queue-shell'
import { cn } from '@/lib/utils'
import { QA_QUEUE_ITEMS } from '@/lib/qa-mock-data'

export default function QaQueuePage() {
  const router = useRouter()

  return (
    <QueueShell badge="Origin QA" signOutHref="/qa" step={0}>
      <div className="card-surface-raised p-8 sm:p-10">
        <p className="text-eyebrow text-accent">Yorùbá cohort</p>
        <h1 className="text-h2 mt-2 text-balance text-foreground">
          {QA_QUEUE_ITEMS.length} submissions awaiting manual review
        </h1>
        <p className="text-body mt-3 text-pretty text-muted-foreground">
          These passed Automated Validation. Approve for packaging, or reject with a standardized
          defect tag.
        </p>

        <ul className="mt-6 divide-y divide-border/70 border-y border-border/70">
          {QA_QUEUE_ITEMS.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 py-3">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full',
                    item.flag ? 'bg-warning/10' : 'bg-success/10',
                  )}
                >
                  {item.flag ? (
                    <TriangleAlert className="size-4 text-warning" />
                  ) : (
                    <CheckCircle2 className="size-4 text-success" />
                  )}
                </span>
                <div>
                  <p className="text-body-sm font-mono font-medium text-foreground">{item.id}</p>
                  <p className="text-caption text-muted-foreground">
                    {item.duration} · {item.flag ? `Flagged ${item.flag}` : 'No flags'}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <button
          onClick={() => router.push('/qa/item?remaining=4&approved=0&rejected=0')}
          className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 sm:w-auto"
        >
          Start reviewing
          <ArrowRight className="size-4" />
        </button>
      </div>
    </QueueShell>
  )
}
