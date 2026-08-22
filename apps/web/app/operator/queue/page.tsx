import Link from 'next/link'
import { ArrowRight, MessageSquare } from 'lucide-react'
import { QueueShell } from '@/components/shared/queue-shell'
import { serverApiFetch } from '@/lib/api/server'
import type { OperatorQueueItem } from '@/lib/api/endpoints/operator'
import type { AuthUser } from '@oreset/shared'

export default async function OperatorQueuePage() {
  const [{ items }, { user }] = await Promise.all([
    serverApiFetch<{ items: OperatorQueueItem[] }>('/api/v1/operator/queue'),
    serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me'),
  ])
  const clientName = items[0]?.clientName ?? 'Client placement'

  return (
    <QueueShell badge="Client Queue" signOutHref="/operator" step={0}>
      <div className="card-surface-raised p-8 sm:p-10">
        <div className="flex items-center justify-between gap-4">
          <p className="text-eyebrow text-accent">{clientName}</p>
          {user.operatorCode && (
            <p className="text-caption text-muted-foreground">Signed in as {user.operatorCode}</p>
          )}
        </div>
        <h1 className="text-h2 mt-2 text-balance text-foreground">
          {items.length} transcript{items.length === 1 ? '' : 's'} awaiting review
        </h1>
        <p className="text-body mt-3 text-pretty text-muted-foreground">
          Live production output — not Oreset&apos;s own collected data. Review against the
          client&apos;s SOP brief.
        </p>

        {items.length === 0 ? (
          <p className="mt-6 text-body-sm text-muted-foreground">Queue is empty — nothing awaiting review.</p>
        ) : (
          <>
            <ul className="mt-6 divide-y divide-border/70 border-y border-border/70">
              {items.map((item) => (
                <li key={item.id} className="flex items-start gap-3 py-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <MessageSquare className="size-4 text-muted-foreground" />
                  </span>
                  <div>
                    <p className="text-body-sm font-mono font-medium text-foreground">{item.externalRef}</p>
                    <p className="text-caption mt-0.5 text-muted-foreground">{item.content}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/operator/item"
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
