import Link from 'next/link'
import { ArrowRight, Crosshair, RotateCcw, Shield } from 'lucide-react'
import { OperatorAppShell } from '@/components/operator/operator-app-shell'
import { serverApiFetch, redirectIfSignedOut } from '@/lib/api/server'
import type { OperatorQueueItem } from '@/lib/api/endpoints/operator'

const DOMAIN_LABELS: Record<string, string> = {
  claims: 'Claims',
  lending: 'Lending',
  government: 'Government',
  healthcare: 'Healthcare',
  fintech: 'Fintech',
  payments: 'Payments',
}

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
        Live attack scenarios against a client&apos;s AI agent. Assess each one against the
        client&apos;s scope brief.
      </p>

      <div className="mt-6">
        <p className="cx-label text-navy-400">
          {items.length} scenario{items.length === 1 ? '' : 's'} awaiting assessment
        </p>
        {items.length === 0 ? (
          <p className="cx-body mt-2.5 text-navy-400">Queue is empty. Nothing awaiting review.</p>
        ) : (
          <>
            <div className="mt-2.5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const trace = item.traceData
                const domain = trace?.domain ?? null
                const language = trace?.language ?? null
                const attackType = trace?.attackType ?? null
                const isRetest = Boolean(trace?.retestOf)

                return (
                  <div key={item.id} className="cx-card flex flex-col gap-3 p-5">
                    <div className="flex items-center justify-between">
                      <p className="cx-mono-meta flex items-center gap-1.5 font-semibold uppercase tracking-wider text-navy-400">
                        {isRetest ? <RotateCcw className="size-3" /> : <Crosshair className="size-3" />}
                        {isRetest ? 'Retest' : 'Attack scenario'}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {trace?.isDualSolve && <Shield className="size-3 text-warning" aria-label="Dual-solve" />}
                        {attackType && (
                          <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                            {attackType}
                          </span>
                        )}
                        {domain && (
                          <span className="rounded bg-navy-100 px-1.5 py-0.5 text-[10px] font-medium text-navy-500">
                            {DOMAIN_LABELS[domain] ?? domain}
                          </span>
                        )}
                        {language && (
                          <span className="rounded bg-navy-100 px-1.5 py-0.5 text-[10px] font-medium text-navy-500">
                            {language}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h2 className="cx-title text-navy-900">{item.clientName}</h2>
                      <p className="cx-mono-meta mt-0.5 text-navy-400">{item.externalRef}</p>
                    </div>
                    <p className="cx-meta line-clamp-2 text-navy-500">{item.content}</p>
                  </div>
                )
              })}
            </div>

            <Link
              href="/operator/item"
              className="mt-6 inline-flex h-11 w-fit items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600"
            >
              Start assessing
              <ArrowRight className="size-4" />
            </Link>
          </>
        )}
      </div>
    </OperatorAppShell>
  )
}
