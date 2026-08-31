import Link from 'next/link'
import {
  ArrowRight,
  ListChecks,
  TriangleAlert,
  User,
  BadgeCheck,
  FileSignature,
  CheckCircle2,
  Circle,
  Globe,
  Shield,
} from 'lucide-react'
import { serverApiFetch, redirectIfSignedOut } from '@/lib/api/server'
import { OperatorAppShell } from '@/components/operator/operator-app-shell'
import { StatusTag } from '@/components/capture/status-tag'
import { VerificationSeal } from '@/components/capture/verification-seal'
import { ERR_TAG_LABELS } from '@oreset/shared'
import type {
  OperatorStats,
  OperatorDecisionRecord,
  OperatorProfile,
  VerificationsResponse,
  AgreementsResponse,
} from '@/lib/api/endpoints/operator'

type OnboardingStep = {
  id: string
  label: string
  href: string
  complete: boolean
  icon: typeof User
}

export default async function OperatorHomePage() {
  let stats: OperatorStats
  let decisions: OperatorDecisionRecord[]
  let profile: OperatorProfile | null = null
  let verifications: VerificationsResponse | null = null
  let agreements: AgreementsResponse | null = null

  try {
    ;[stats, { decisions }, profile, verifications, agreements] = await Promise.all([
      serverApiFetch<OperatorStats>('/api/v1/operator/me/stats'),
      serverApiFetch<{ decisions: OperatorDecisionRecord[] }>('/api/v1/operator/me/decisions'),
      serverApiFetch<OperatorProfile>('/api/v1/operator/me/profile').catch(() => null),
      serverApiFetch<VerificationsResponse>('/api/v1/operator/me/verifications').catch(() => null),
      serverApiFetch<AgreementsResponse>('/api/v1/operator/me/agreements').catch(() => null),
    ])
  } catch (err) {
    redirectIfSignedOut(err, '/operator')
  }

  const recent = decisions.slice(0, 5)

  const profileComplete = (profile?.profileStrength ?? 0) >= 75
  const verificationComplete = verifications?.overallStatus === 'verified'
  const verificationPending = verifications?.overallStatus === 'pending'
  const agreementsSigned = agreements?.required.every((r) => r.signed) ?? false
  const agreementsCount = agreements?.required.filter((r) => r.signed).length ?? 0
  const agreementsTotal = agreements?.required.length ?? 3

  const languages = profile?.application?.languages ?? []

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'profile',
      label: 'Complete your profile',
      href: '/operator/settings',
      complete: profileComplete,
      icon: User,
    },
    {
      id: 'verification',
      label: 'Verify your identity',
      href: '/operator/settings',
      complete: verificationComplete,
      icon: BadgeCheck,
    },
    {
      id: 'agreements',
      label: 'Sign required agreements',
      href: '/operator/settings',
      complete: agreementsSigned,
      icon: FileSignature,
    },
  ]

  const onboardingDone = onboardingSteps.every((s) => s.complete)
  const completedSteps = onboardingSteps.filter((s) => s.complete).length

  return (
    <OperatorAppShell>
      {/* Profile Telemetry Bar */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="cx-page-title text-navy-900">
              {profile?.user.displayName ?? 'Reviewer'}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
              {languages.length > 0 && (
                <span className="cx-meta flex items-center gap-1 text-navy-500">
                  <Globe className="size-3" />
                  {languages.map((l) => l.language).join(', ')}
                </span>
              )}
              <span className="cx-meta flex items-center gap-1 text-navy-500">
                <Shield className="size-3" />
                {verificationComplete
                  ? 'Verified'
                  : verificationPending
                    ? 'Verification pending'
                    : 'Not verified'}
              </span>
              {profile?.user.operatorCode && (
                <span className="cx-mono-meta text-navy-400">{profile.user.operatorCode}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-center">
              <p className="font-mono text-2xl font-semibold tabular-nums text-navy-900">
                {stats.reviewedToday}
              </p>
              <p className="cx-meta text-navy-400">Today</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="font-mono text-2xl font-semibold tabular-nums text-navy-900">
                {stats.reviewedAllTime}
              </p>
              <p className="cx-meta text-navy-400">All-time</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="font-mono text-2xl font-semibold tabular-nums text-navy-900">
                {stats.approvalRate === null ? '—' : `${stats.approvalRate}%`}
              </p>
              <p className="cx-meta text-navy-400">Approval</p>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Checklist — only shown if not all steps are done */}
      {!onboardingDone && (
        <div className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-navy-900">Get started</p>
              <p className="cx-meta mt-0.5 text-navy-500">
                Complete these steps to start receiving review cases.
              </p>
            </div>
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-accent">
              {completedSteps}/{onboardingSteps.length}
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {onboardingSteps.map((step) => (
              <Link
                key={step.id}
                href={step.href}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3.5 hover:bg-navy-50/60"
              >
                {step.complete ? (
                  <CheckCircle2 className="size-5 shrink-0 text-success" />
                ) : (
                  <Circle className="size-5 shrink-0 text-navy-300" />
                )}
                <step.icon className="size-4 shrink-0 text-navy-400" />
                <span className="cx-body font-medium text-navy-900">{step.label}</span>
                {!step.complete && <ArrowRight className="ml-auto size-4 text-navy-300" />}
              </Link>
            ))}
          </div>
        </div>
      )}

      {stats.openTicketsFromMe > 0 && (
        <div className="cx-card mt-6 flex items-center gap-3 border-warning/30 bg-warning/5 p-4">
          <TriangleAlert className="size-4 shrink-0 text-warning" />
          <p className="cx-body text-navy-500">
            <span className="font-mono font-semibold text-navy-900">{stats.openTicketsFromMe}</span> of your
            escalations {stats.openTicketsFromMe === 1 ? 'is' : 'are'} still open with the client team.
          </p>
        </div>
      )}

      <Link
        href="/operator/queue"
        className="cx-card mt-6 flex items-center justify-between gap-4 border-accent/30 bg-accent/5 p-6 hover:bg-accent/10"
      >
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <ListChecks className="size-6" />
          </span>
          <div>
            <p className="cx-label text-accent">Queue</p>
            <p className="cx-title mt-0.5 text-navy-900">Client placement awaiting review</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="cx-stat text-navy-900">{stats.queueRemaining}</p>
            <p className="cx-meta text-navy-400">remaining</p>
          </div>
          <ArrowRight className="size-5 shrink-0 text-accent" />
        </div>
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div>
          <p className="cx-label text-navy-400">Recent decisions</p>
          {recent.length === 0 ? (
            <p className="cx-body mt-2.5 text-navy-400">Nothing decided yet — the queue is waiting.</p>
          ) : (
            <div className="cx-card mt-2.5 divide-y divide-border">
              {recent.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="cx-body font-medium text-navy-900">
                      {d.clientItemSnapshot?.clientName ?? 'Client placement'}
                    </p>
                    <p className="cx-mono-meta text-navy-400">{new Date(d.createdAt).toLocaleString()}</p>
                  </div>
                  {d.decision === 'approved' && <VerificationSeal label="Approved" />}
                  {d.decision === 'corrected' && <StatusTag tone="success">Corrected</StatusTag>}
                  {d.decision === 'rejected' && <StatusTag tone="destructive">Rejected</StatusTag>}
                  {d.decision === 'escalated' && (
                    <StatusTag tone={d.ticket?.status === 'resolved' ? 'success' : 'warning'}>
                      {d.ticket?.status === 'resolved' ? 'Ticket resolved' : 'Ticket open'}
                    </StatusTag>
                  )}
                  {d.decision === 'declined' && <StatusTag tone="neutral">Declined</StatusTag>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="cx-label text-navy-400">What I&apos;ve been flagging</p>
          <div className="cx-card mt-2.5 divide-y divide-border">
            {Object.entries(stats.errTagBreakdown).map(([tag, n]) => (
              <div key={tag} className="flex items-center justify-between gap-4 p-4">
                <span className="cx-mono-meta font-semibold text-navy-500">{tag}</span>
                <span className="cx-meta text-right text-navy-400">
                  <span className="font-mono font-semibold text-navy-900">{n}</span>{' '}
                  {ERR_TAG_LABELS[tag as keyof typeof ERR_TAG_LABELS]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </OperatorAppShell>
  )
}
