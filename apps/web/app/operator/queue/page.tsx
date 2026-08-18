'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, MessageSquare } from 'lucide-react'
import { QueueShell } from '@/components/shared/queue-shell'
import { CLIENT_PLACEMENT, CLIENT_QUEUE_ITEMS } from '@/lib/operator-mock-data'

export default function OperatorQueuePage() {
  const router = useRouter()

  return (
    <QueueShell badge="Client Queue" signOutHref="/operator" step={0}>
      <div className="card-surface-raised p-8 sm:p-10">
        <p className="text-eyebrow text-accent">{CLIENT_PLACEMENT.clientName}</p>
        <h1 className="text-h2 mt-2 text-balance text-foreground">
          {CLIENT_QUEUE_ITEMS.length} transcripts awaiting review
        </h1>
        <p className="text-body mt-3 text-pretty text-muted-foreground">
          Live production output — not Oreset&apos;s own collected data. Review against the
          client&apos;s SOP brief.
        </p>

        <ul className="mt-6 divide-y divide-border/70 border-y border-border/70">
          {CLIENT_QUEUE_ITEMS.map((item) => (
            <li key={item.id} className="flex items-start gap-3 py-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <MessageSquare className="size-4 text-muted-foreground" />
              </span>
              <div>
                <p className="text-body-sm font-mono font-medium text-foreground">{item.id}</p>
                <p className="text-caption mt-0.5 text-muted-foreground">{item.transcript}</p>
              </div>
            </li>
          ))}
        </ul>

        <button
          onClick={() => router.push('/operator/item?remaining=4&approved=0&escalated=0&rejected=0')}
          className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 sm:w-auto"
        >
          Start reviewing
          <ArrowRight className="size-4" />
        </button>
      </div>
    </QueueShell>
  )
}
