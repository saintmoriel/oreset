'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { PartyPopper } from 'lucide-react'
import { QueueShell } from '@/components/shared/queue-shell'

function QaCompleteContent() {
  const params = useSearchParams()
  const approved = params.get('approved') ?? '0'
  const rejected = params.get('rejected') ?? '0'

  return (
    <QueueShell badge="Origin QA" signOutHref="/qa" step={2}>
      <div className="card-surface-raised flex flex-col items-start gap-4 p-8 sm:p-10" role="status">
        <span className="flex size-12 items-center justify-center rounded-xl bg-success/10">
          <PartyPopper className="size-6 text-success" />
        </span>
        <h1 className="text-h2 text-foreground">Queue cleared.</h1>
        <p className="text-body text-pretty text-muted-foreground">
          Approved items move to Assembly for packaging. Rejected items are excluded and not paid.
        </p>

        <div className="grid w-full grid-cols-2 gap-3">
          <div className="rounded-lg border border-success/20 bg-success/5 p-4 text-center">
            <p className="text-h3 text-success">{approved}</p>
            <p className="text-caption mt-1 text-muted-foreground">Approved</p>
          </div>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center">
            <p className="text-h3 text-destructive">{rejected}</p>
            <p className="text-caption mt-1 text-muted-foreground">Rejected</p>
          </div>
        </div>

        <div className="mt-2 flex w-full flex-col gap-3 sm:flex-row">
          <Link
            href="/qa/queue"
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600"
          >
            Return to queue
          </Link>
          <Link
            href="/qa"
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md border border-border px-6 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Sign out
          </Link>
        </div>
      </div>
    </QueueShell>
  )
}

export default function QaCompletePage() {
  return (
    <Suspense>
      <QaCompleteContent />
    </Suspense>
  )
}
