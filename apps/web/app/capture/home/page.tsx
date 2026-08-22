import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock, FileCheck2, HelpCircle, ListChecks, ShieldCheck, User, Wallet, XCircle } from 'lucide-react'
import { serverApiFetch } from '@/lib/api/server'
import { CaptureAppShell } from '@/components/capture/capture-app-shell'
import { ResumeBanner } from '@/components/capture/resume-banner'
import { formatRate } from '@/lib/capture-format'
import { cn } from '@/lib/utils'
import type { Batch } from '@/lib/api/endpoints/batches'
import type { SubmissionSummary } from '@/lib/api/endpoints/submissions'
import type { Payout } from '@/lib/api/endpoints/payouts'
import type { SubmissionStatus } from '@oreset/shared'

const STATUS_STYLE: Record<SubmissionStatus, { icon: typeof Clock; label: string; text: string }> = {
  submitted: { icon: XCircle, label: 'Flagged', text: 'text-destructive' },
  validated: { icon: Clock, label: 'Awaiting review', text: 'text-navy-400' },
  qa_approved: { icon: CheckCircle2, label: 'Approved', text: 'text-success' },
  qa_rejected: { icon: XCircle, label: 'Rejected', text: 'text-destructive' },
}

const QUICK_LINKS = [
  { href: '/capture/batches', label: 'Batches', icon: ListChecks },
  { href: '/capture/submissions', label: 'Submissions', icon: FileCheck2 },
  { href: '/capture/payouts', label: 'Payouts', icon: Wallet },
  { href: '/capture/privacy', label: 'Data & Privacy', icon: ShieldCheck },
  { href: '/capture/account', label: 'Account', icon: User },
  { href: '/capture/help', label: 'Help', icon: HelpCircle },
]

export default async function CaptureHomePage() {
  const [{ batches: availableBatches }, { submissions }, { payouts }] = await Promise.all([
    serverApiFetch<{ batches: Batch[] }>('/api/v1/batches'),
    serverApiFetch<{ submissions: SubmissionSummary[] }>('/api/v1/submissions/me'),
    serverApiFetch<{ payouts: Payout[] }>('/api/v1/payouts/me'),
  ])

  const currency = payouts[0]?.currency ?? 'NGN'
  const paidTotal = payouts.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amountMinorUnits, 0)
  const pendingTotal = payouts
    .filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + p.amountMinorUnits, 0)
  const lastSubmission = submissions[0] as SubmissionSummary | undefined

  return (
    <CaptureAppShell active="home">
      <p className="cx-label text-navy-400">Welcome back</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Home</h1>

      <div className="mt-6">
        <ResumeBanner batches={availableBatches} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/capture/payouts" className="cx-card p-5 hover:border-accent/40">
          <p className="cx-meta text-navy-400">Lifetime paid</p>
          <p className="cx-stat mt-1 text-navy-900">{formatRate(paidTotal, currency)}</p>
        </Link>
        <Link href="/capture/payouts" className="cx-card p-5 hover:border-accent/40">
          <p className="cx-meta text-navy-400">Pending</p>
          <p className="cx-stat mt-1 text-navy-900">{formatRate(pendingTotal, currency)}</p>
        </Link>
        <Link href="/capture/batches" className="cx-card p-5 hover:border-accent/40">
          <p className="cx-meta text-navy-400">Batches available</p>
          <p className="cx-stat mt-1 text-navy-900">{availableBatches.length}</p>
        </Link>
      </div>

      <div className="mt-6">
        <p className="cx-label text-navy-400">Last submission</p>
        {lastSubmission ? (
          <Link
            href="/capture/submissions"
            className="cx-card mt-2.5 flex items-center justify-between gap-4 p-5 hover:border-accent/40"
          >
            {(() => {
              const { icon: Icon, label, text } = STATUS_STYLE[lastSubmission.status]
              return (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={cn('size-4 shrink-0', text)} />
                    <div>
                      <p className="cx-body font-medium text-navy-900">{lastSubmission.batch.title}</p>
                      <p className="cx-meta text-navy-400">
                        {new Date(lastSubmission.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={cn('cx-meta font-semibold', text)}>{label}</span>
                </>
              )
            })()}
          </Link>
        ) : (
          <p className="cx-body mt-2.5 text-navy-400">Nothing submitted yet — start a batch to begin.</p>
        )}
      </div>

      <div className="mt-8">
        <p className="cx-label text-navy-400">Quick links</p>
        <div className="mt-2.5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="cx-card group flex flex-col justify-between gap-6 p-5 hover:border-accent/40 hover:bg-accent/3"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent/15">
                <link.icon className="size-5" />
              </span>
              <span className="flex items-center justify-between gap-2">
                <span className="cx-title text-navy-900">{link.label}</span>
                <ArrowRight className="size-4 shrink-0 text-navy-300 transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </CaptureAppShell>
  )
}
