import Link from 'next/link'
import { ArrowRight, FileCheck2, HelpCircle, ListChecks, ShieldCheck, TriangleAlert, User, Wallet } from 'lucide-react'
import { serverApiFetch, redirectIfSignedOut } from '@/lib/api/server'
import { CaptureAppShell } from '@/components/capture/capture-app-shell'
import { ResumeBanner } from '@/components/capture/resume-banner'
import { StatusTag, TONE_TEXT_CLASS } from '@/components/capture/status-tag'
import { VerificationSeal } from '@/components/capture/verification-seal'
import { formatRate, computeStreak } from '@/lib/capture-format'
import { SUBMISSION_STATUS_META } from '@/lib/submission-status'
import { cn } from '@/lib/utils'
import type { Batch } from '@/lib/api/endpoints/batches'
import type { SubmissionSummary } from '@/lib/api/endpoints/submissions'
import type { Payout } from '@/lib/api/endpoints/payouts'
import type { AuthUser } from '@oreset/shared'

function AlertCard({
  href,
  icon: Icon,
  title,
  detail,
}: {
  href: string
  icon: typeof TriangleAlert
  title: string
  detail: string
}) {
  return (
    <Link
      href={href}
      className="cx-card flex items-center justify-between gap-3 border-warning/30 bg-warning/5 p-4 hover:bg-warning/10"
    >
      <div className="flex items-center gap-3">
        <Icon className="size-4 shrink-0 text-warning" />
        <div>
          <p className="cx-body font-medium text-navy-900">{title}</p>
          <p className="cx-meta text-navy-400">{detail}</p>
        </div>
      </div>
      <ArrowRight className="size-4 shrink-0 text-warning" />
    </Link>
  )
}

export default async function CaptureHomePage() {
  let availableBatches: Batch[]
  let submissions: SubmissionSummary[]
  let payouts: Payout[]
  let user: AuthUser
  try {
    ;[{ batches: availableBatches }, { submissions }, { payouts }, { user }] = await Promise.all([
      serverApiFetch<{ batches: Batch[] }>('/api/v1/batches'),
      serverApiFetch<{ submissions: SubmissionSummary[] }>('/api/v1/submissions/me'),
      serverApiFetch<{ payouts: Payout[] }>('/api/v1/payouts/me'),
      serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me'),
    ])
  } catch (err) {
    redirectIfSignedOut(err, '/capture')
  }

  const currency = payouts[0]?.currency ?? 'NGN'
  const paidTotal = payouts.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amountMinorUnits, 0)
  const pendingTotal = payouts
    .filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + p.amountMinorUnits, 0)
  const lastSubmission = submissions[0] as SubmissionSummary | undefined
  const streak = computeStreak(submissions.map((s) => s.createdAt))

  // Real, derived "needs your attention" signals — not fabricated
  // notifications (push/SMS stays explicitly out of scope, per round 3).
  // Each one is either the single most-recent submission's real state or
  // a real gap in already-fetched account data, so nothing here can go
  // stale the way a naive all-time count of past failures would.
  const lastSubmissionNeedsRetake =
    lastSubmission && (lastSubmission.status === 'qa_rejected' || lastSubmission.status === 'submitted')
  const hasApprovedEarnings = submissions.some((s) => s.status === 'qa_approved')
  const needsPayoutDetails = hasApprovedEarnings && !user.payoutDetails

  const supportLinks: {
    href: string
    label: string
    icon: typeof ListChecks
    stat?: string
    caption?: string
    description?: string
  }[] = [
    {
      href: '/capture/submissions',
      label: 'Submissions',
      icon: FileCheck2,
      stat: String(submissions.length),
      caption: submissions.length === 1 ? 'submission' : 'submissions',
    },
    {
      href: '/capture/payouts',
      label: 'Payouts',
      icon: Wallet,
      stat: formatRate(pendingTotal, currency),
      caption: 'pending',
    },
    streak > 0
      ? { href: '/capture/account', label: 'Account', icon: User, stat: String(streak), caption: `day streak` }
      : { href: '/capture/account', label: 'Account', icon: User, description: 'Your profile & standing' },
    { href: '/capture/privacy', label: 'Data & Privacy', icon: ShieldCheck, description: 'Export or delete your data' },
    { href: '/capture/help', label: 'Help', icon: HelpCircle, description: 'Talk to a real person' },
  ]

  return (
    <CaptureAppShell>
      <p className="cx-label text-navy-400">Welcome back</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Home</h1>

      {/* Alerts — a dedicated space for things that actually need action
          right now, ahead of the hero. Only ever real, derived signals
          (an in-progress batch, the most recent submission's real state,
          a real gap in payout setup) — nothing fabricated, and nothing
          rendered when there's genuinely nothing to flag. */}
      {(lastSubmissionNeedsRetake || needsPayoutDetails) && (
        <div className="mt-6">
          <p className="cx-label text-warning">Needs your attention</p>
          <div className="mt-2.5 flex flex-col gap-2.5">
            {lastSubmissionNeedsRetake && lastSubmission && (
              <AlertCard
                href={`/capture/batches/${lastSubmission.batch.id}`}
                icon={TriangleAlert}
                title="Your last submission needs a retake"
                detail={
                  lastSubmission.latestValidation?.reason
                    ? `${lastSubmission.batch.title} — ${lastSubmission.latestValidation.reason}`
                    : lastSubmission.batch.title
                }
              />
            )}
            {needsPayoutDetails && (
              <AlertCard
                href="/capture/payouts"
                icon={Wallet}
                title="Add your payout details"
                detail="You've earned money that can't be paid out until you do."
              />
            )}
          </div>
        </div>
      )}

      <div className="mt-6">
        <ResumeBanner batches={availableBatches} />
      </div>

      {/* Hero — the single dominant zone. Lifetime paid is the number a
          contributor opens this app to check first, so it gets the one
          navy zone on the page, the biggest type, and copper as the only
          accent — everything else on this page is deliberately quieter. */}
      <Link
        href="/capture/payouts"
        className="block rounded-xl border border-navy-900 bg-navy-900 p-6 transition-colors hover:border-copper-500 sm:p-8"
      >
        <p className="cx-label text-copper-300">Lifetime paid</p>
        <p className="mt-2 font-mono text-4xl font-semibold tracking-tight tabular-nums text-white sm:text-5xl">
          {formatRate(paidTotal, currency)}
        </p>
        <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4">
          <span className="cx-meta text-white/50">Pending</span>
          <span className="cx-body font-mono font-semibold tabular-nums text-white/90">
            {formatRate(pendingTotal, currency)}
          </span>
          <ArrowRight className="ml-auto size-4 shrink-0 text-copper-300" />
        </div>
      </Link>

      <div className="mt-6">
        <p className="cx-label text-navy-400">Last submission</p>
        {lastSubmission ? (
          <Link
            href="/capture/submissions"
            className="cx-card mt-2.5 flex items-center justify-between gap-4 p-5 hover:border-accent/40"
          >
            {(() => {
              const { icon: Icon, label, tone } = SUBMISSION_STATUS_META[lastSubmission.status]
              return (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={cn('size-4 shrink-0', TONE_TEXT_CLASS[tone])} />
                    <div>
                      <p className="cx-body font-medium text-navy-900">{lastSubmission.batch.title}</p>
                      <p className="cx-mono-meta text-navy-400">
                        {new Date(lastSubmission.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {lastSubmission.status === 'qa_approved' ? (
                    <VerificationSeal label={label} />
                  ) : (
                    <StatusTag tone={tone}>{label}</StatusTag>
                  )}
                </>
              )
            })()}
          </Link>
        ) : (
          <div className="cx-card mt-2.5 flex items-center justify-between gap-4 p-5">
            <p className="cx-body text-navy-500">You haven&apos;t submitted anything yet.</p>
            <Link
              href="/capture/batches"
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-copper-600"
            >
              Start a batch
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Featured — the second-most important thing: is there work to do.
          Deliberately shaped differently from the supporting row below
          (a wide banner, not a grid tile) and carries its own real number
          instead of just a label + icon. */}
      <Link
        href="/capture/batches"
        className="cx-card mt-8 flex items-center justify-between gap-4 border-accent/30 bg-accent/5 p-6 hover:bg-accent/10"
      >
        <div>
          <p className="cx-label text-accent">Batches</p>
          <p className="cx-title mt-0.5 text-navy-900">Work available right now</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="cx-stat text-navy-900">{availableBatches.length}</p>
            <p className="cx-meta text-navy-400">available</p>
          </div>
          <ArrowRight className="size-5 shrink-0 text-accent" />
        </div>
      </Link>

      {/* Supporting — genuinely secondary: smaller type, tighter cards,
          each carrying whatever real fact it actually has (a count, a
          preview, or a one-line description) rather than a copy-pasted
          icon-badge-and-label. */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {supportLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="cx-card flex flex-col gap-3 p-4 hover:border-accent/40"
          >
            <span className="flex items-center gap-1.5 text-navy-400">
              <link.icon className="size-3.5 shrink-0" />
              <span className="cx-label">{link.label}</span>
            </span>
            {link.stat ? (
              <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">
                {link.stat}
                {link.caption && <span className="cx-meta ml-1 font-sans font-normal text-navy-400">{link.caption}</span>}
              </p>
            ) : (
              <p className="cx-meta text-navy-500">{link.description}</p>
            )}
          </Link>
        ))}
      </div>
    </CaptureAppShell>
  )
}
