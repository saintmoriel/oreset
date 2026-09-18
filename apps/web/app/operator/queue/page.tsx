import Link from 'next/link'
import { ArrowRight, Crosshair, RotateCcw, Shield, FileSignature, Target, CheckCircle2, Circle } from 'lucide-react'
import { OperatorAppShell } from '@/components/operator/operator-app-shell'
import { serverApiFetch, redirectIfSignedOut } from '@/lib/api/server'
import { ApiError } from '@/lib/api/client'
import type { OperatorQueueItem } from '@/lib/api/endpoints/operator'
import type { OnboardingStatus } from '@/lib/api/endpoints/operators'

const DOMAIN_LABELS: Record<string, string> = {
  claims: 'Claims',
  lending: 'Lending',
  government: 'Government',
  healthcare: 'Healthcare',
  fintech: 'Fintech',
  payments: 'Payments',
}

function OnboardingGate({ status }: { status: OnboardingStatus }) {
  const steps = [
    {
      label: `Sign the agreements (${status.agreementsSigned} of ${status.agreementsRequired})`,
      done: status.agreementsSigned >= status.agreementsRequired,
      href: '/operator/settings',
      icon: FileSignature,
    },
    {
      label: `Pass calibration (${status.calibrationPassed} of ${status.calibrationRequired} passes)`,
      done: status.calibrationPassed >= status.calibrationRequired,
      href: '/operator/calibration',
      icon: Target,
    },
  ]
  return (
    <div className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-5">
      <p className="text-sm font-semibold text-navy-900">Two steps before your live queue opens</p>
      <p className="cx-meta mt-0.5 text-navy-500">
        You are approved. Client scenarios unlock once both are done. Each takes a few minutes.
      </p>
      <div className="mt-4 space-y-2">
        {steps.map((s) => (
          <Link key={s.href} href={s.href} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3.5 hover:bg-navy-50/60">
            {s.done ? <CheckCircle2 className="size-5 shrink-0 text-success" /> : <Circle className="size-5 shrink-0 text-navy-300" />}
            <s.icon className="size-4 shrink-0 text-navy-400" />
            <span className="cx-body font-medium text-navy-900">{s.label}</span>
            {!s.done && <ArrowRight className="ml-auto size-4 text-navy-300" />}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default async function OperatorQueuePage() {
  let items: OperatorQueueItem[] = []
  let gate: OnboardingStatus | null = null
  try {
    ;({ items } = await serverApiFetch<{ items: OperatorQueueItem[] }>('/api/v1/operator/queue'))
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      // Approved but not onboarded: the queue stays closed and we show why.
      gate = await serverApiFetch<OnboardingStatus>('/api/v1/operator/me/onboarding').catch(() => null)
      if (!gate) redirectIfSignedOut(err, '/operator')
    } else {
      redirectIfSignedOut(err, '/operator')
    }
  }

  return (
    <OperatorAppShell>
      <p className="cx-label text-navy-400">Client Queue</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Queue</h1>
      <p className="cx-body mt-2 max-w-2xl text-navy-500">
        Live attack scenarios against a client&apos;s AI agent. Assess each one against the
        client&apos;s scope brief.
      </p>

      {gate ? (
        <OnboardingGate status={gate} />
      ) : (
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
                            <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">{attackType}</span>
                          )}
                          {domain && (
                            <span className="rounded bg-navy-100 px-1.5 py-0.5 text-[10px] font-medium text-navy-500">{DOMAIN_LABELS[domain] ?? domain}</span>
                          )}
                          {language && (
                            <span className="rounded bg-navy-100 px-1.5 py-0.5 text-[10px] font-medium text-navy-500">{language}</span>
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
      )}
    </OperatorAppShell>
  )
}
