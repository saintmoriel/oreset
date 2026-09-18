import Link from 'next/link'
import { ArrowRight, ShieldAlert, TriangleAlert, GitCompare, Users, Crosshair, RotateCcw, Inbox } from 'lucide-react'
import { AdminAppShell } from '@/components/admin/admin-app-shell'
import { serverApiFetch, redirectIfSignedOut } from '@/lib/api/server'
import type { AdminOverview } from '@/lib/api/endpoints/admin'
import { formatMoney } from '@/lib/api/endpoints/people'

export default async function AdminHomePage() {
  let overview: AdminOverview
  try {
    overview = await serverApiFetch<AdminOverview>('/api/v1/admin/overview')
  } catch (err) {
    redirectIfSignedOut(err, '/admin')
  }

  return (
    <AdminAppShell>
      <p className="cx-label text-navy-400">Engagement operations</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Home</h1>

      {overview.role === 'admin' && <AdminOverviewView overview={overview} />}
      {overview.role === 'reviewer_lead' && <ReviewerLeadOverviewView overview={overview} />}
      {overview.role === 'compliance' && <ComplianceOverviewView overview={overview} />}
    </AdminAppShell>
  )
}

function ActionTile({
  href,
  icon: Icon,
  label,
  value,
  tone = 'neutral',
}: {
  href: string
  icon: typeof ShieldAlert
  label: string
  value: number
  tone?: 'neutral' | 'warning' | 'destructive'
}) {
  const iconTone =
    tone === 'destructive' ? 'bg-destructive/10 text-destructive' : tone === 'warning' ? 'bg-warning/10 text-warning' : 'bg-navy-100 text-navy-500'
  return (
    <Link href={href} className="cx-card flex items-center gap-3 p-4 hover:bg-navy-50/60">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${iconTone}`}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">{value}</p>
        <p className="cx-meta truncate text-navy-400">{label}</p>
      </div>
      <ArrowRight className="size-4 shrink-0 text-navy-300" />
    </Link>
  )
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="p-5">
      <p className="cx-meta text-navy-400">{label}</p>
      <p className="cx-stat mt-1 text-navy-900">{value}</p>
      {hint && <p className="cx-meta mt-0.5 text-navy-400">{hint}</p>}
    </div>
  )
}

function AdminOverviewView({ overview: o }: { overview: Extract<AdminOverview, { role: 'admin' }> }) {
  return (
    <>
      {/* One number to act on: everything below it is a queue someone owns today. */}
      <div className="mt-6 rounded-xl border border-navy-900 bg-navy-900 p-6 sm:p-8">
        <p className="cx-label text-copper-300">Needs a decision today</p>
        <p className="mt-2 font-mono text-4xl font-semibold tracking-tight tabular-nums text-white sm:text-5xl">
          {o.needsAttention}
        </p>
        <p className="cx-meta mt-2 text-white/60">
          New leads to answer, findings to verify, escalations to resolve, split assessments to adjudicate, testers to approve.
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <ActionTile href="/admin/leads" icon={Inbox} label="New leads" value={o.newLeads} tone="warning" />
        <ActionTile href="/admin/findings" icon={ShieldAlert} label="Findings awaiting verification" value={o.findingsAwaitingVerification} tone="destructive" />
        <ActionTile href="/admin/tickets" icon={TriangleAlert} label="Open escalations" value={o.openEscalations} tone="warning" />
        <ActionTile href="/admin/consensus" icon={GitCompare} label="Split assessments" value={o.consensusSplits} tone="warning" />
        <ActionTile href="/admin/applications" icon={Users} label="Tester applications" value={o.pendingTesterApplications} />
      </div>

      <div className="mt-8">
        <p className="cx-label text-navy-400">The business</p>
        <div className="cx-card mt-2.5 grid grid-cols-2 divide-y divide-border sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          <Link href="/admin/clients" className="hover:bg-navy-50/60"><Stat label="Clients" value={o.business.clientsActive} hint={`${o.business.engagementsRunning} with an engagement running`} /></Link>
          <Link href="/admin/people" className="hover:bg-navy-50/60"><Stat label="Red team testers" value={o.business.testersActive} hint="active accounts" /></Link>
          <Stat
            label="Collected, last 30 days"
            value={o.business.revenue30d.length === 0 ? 'nothing yet' : o.business.revenue30d.map((r) => formatMoney(r.minorUnits, r.currency)).join(' + ')}
            hint="paid invoices"
          />
          <Stat label="Verdicts recorded" value={o.totalVerified} hint={o.falsePositiveRate === null ? 'no false positive rate yet' : `${o.falsePositiveRate}% false positives`} />
        </div>
      </div>

      <div className="mt-8">
        <p className="cx-label text-navy-400">Engagements</p>
        <div className="cx-card mt-2.5 grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Stat label="Active clients" value={o.activeClients} hint="scenarios in the last 30 days" />
          <Stat label="Scenarios in queue" value={o.scenariosQueued} hint={`${o.retestsQueued} of them retests`} />
          <Stat label="Assessed this week" value={o.scenariosAssessed7d} hint={o.exploitRate7d === null ? 'no assessments yet' : `${o.exploited7d} exploited, ${o.exploitRate7d}% exploit rate`} />
        </div>
      </div>

      <div className="mt-8">
        <p className="cx-label text-navy-400">Findings across all clients</p>
        <div className="cx-card mt-2.5 grid grid-cols-3 divide-x divide-border">
          <Stat label="Open" value={o.findingsOpen} />
          <Stat label="In retest" value={o.findingsInRetest} />
          <Stat label="Closed" value={o.findingsClosed} />
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Link href="/admin/operators" className="cx-card flex items-center gap-3 p-4 hover:bg-navy-50/60">
          <Users className="size-4 text-accent" />
          <span className="cx-body font-medium text-navy-900">Tester performance</span>
        </Link>
        <Link href="/admin/calibration" className="cx-card flex items-center gap-3 p-4 hover:bg-navy-50/60">
          <Crosshair className="size-4 text-accent" />
          <span className="cx-body font-medium text-navy-900">Calibration cases</span>
        </Link>
        <Link href="/admin/regressions" className="cx-card flex items-center gap-3 p-4 hover:bg-navy-50/60">
          <RotateCcw className="size-4 text-accent" />
          <span className="cx-body font-medium text-navy-900">Regression exports</span>
        </Link>
      </div>

      <RecentActivity entries={o.recentAuditEntries} />
    </>
  )
}

function ReviewerLeadOverviewView({ overview: o }: { overview: Extract<AdminOverview, { role: 'reviewer_lead' }> }) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      <ActionTile href="/admin/findings" icon={ShieldAlert} label="Findings awaiting your verification" value={o.findingsAwaitingVerification} tone="destructive" />
      <ActionTile href="/admin/tickets" icon={TriangleAlert} label="Open escalations" value={o.openEscalations} tone="warning" />
      <ActionTile href="/admin/consensus" icon={GitCompare} label="Split assessments to adjudicate" value={o.consensusSplits} tone="warning" />
    </div>
  )
}

function ComplianceOverviewView({ overview: o }: { overview: Extract<AdminOverview, { role: 'compliance' }> }) {
  return (
    <div className="mt-6">
      <Link
        href="/admin/audit-log"
        className="cx-card flex items-center justify-between gap-4 border-accent/30 bg-accent/5 p-6 hover:bg-accent/10"
      >
        <div>
          <p className="cx-label text-accent">Audit Log</p>
          <p className="cx-title mt-0.5 text-navy-900">Full system event history</p>
        </div>
        <ArrowRight className="size-5 shrink-0 text-accent" />
      </Link>
      <RecentActivity entries={o.recentAuditEntries} />
    </div>
  )
}

function RecentActivity({ entries }: { entries: AdminOverviewAudit }) {
  return (
    <div className="mt-8">
      <p className="cx-label text-navy-400">Recent activity</p>
      {entries.length === 0 ? (
        <p className="cx-body mt-2.5 text-navy-400">Nothing logged yet.</p>
      ) : (
        <div className="cx-card mt-2.5 divide-y divide-border">
          {entries.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="cx-mono-meta font-semibold text-navy-800">{e.action}</p>
                <p className="cx-mono-meta mt-0.5 text-navy-400">{e.actorLabel} · {e.actorRole}</p>
              </div>
              <p className="cx-mono-meta shrink-0 text-navy-300">{new Date(e.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

type AdminOverviewAudit = Extract<AdminOverview, { role: 'admin' }>['recentAuditEntries']
