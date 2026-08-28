import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { OperatorAppShell } from '@/components/operator/operator-app-shell'
import { serverApiFetch, redirectIfSignedOut } from '@/lib/api/server'
import type { OperatorQueueItem } from '@/lib/api/endpoints/operator'

export default async function OperatorQueuePage() {
  let items: OperatorQueueItem[]
  try {
    ;({ items } = await serverApiFetch<{ items: OperatorQueueItem[] }>('/api/v1/operator/queue'))
  } catch (err) {
    redirectIfSignedOut(err, '/operator')
  }

  return (
    <OperatorAppShell>
      <p className="cx-label text-navy-400">Client Queue</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Queue</h1>
      <p className="cx-body mt-2 max-w-2xl text-navy-500">
        Live production output — not Oreset&apos;s own collected data. Review against the client&apos;s
        SOP brief.
      </p>

      <div className="mt-6">
        <p className="cx-label text-navy-400">
          {items.length} transcript{items.length === 1 ? '' : 's'} awaiting review
        </p>
        {items.length === 0 ? (
          <p className="cx-body mt-2.5 text-navy-400">Queue is empty — nothing awaiting review.</p>
        ) : (
          <>
            <div className="mt-2.5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div key={item.id} className="cx-card flex flex-col gap-3 p-5">
                  <p className="cx-mono-meta font-semibold uppercase tracking-wider text-navy-400">Transcript</p>
                  <div>
                    <h2 className="cx-title text-navy-900">{item.clientName}</h2>
                    <p className="cx-mono-meta mt-0.5 text-navy-400">{item.externalRef}</p>
                  </div>
                  <p className="cx-meta line-clamp-2 text-navy-500">{item.content}</p>
                </div>
              ))}
            </div>

            <Link
              href="/operator/item"
              className="mt-6 inline-flex h-11 w-fit items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600"
            >
              Start reviewing
              <ArrowRight className="size-4" />
            </Link>
          </>
        )}
      </div>
    </OperatorAppShell>
  )
}
