import Link from 'next/link'
import { ArrowRight, Megaphone, ListChecks, ClipboardList, Package } from 'lucide-react'
import { AdminAppShell } from '@/components/admin/admin-app-shell'
import { serverApiFetch, redirectIfSignedOut } from '@/lib/api/server'
import type { AdminOverview } from '@/lib/api/endpoints/admin'

export default async function AdminHomePage() {
  let overview: AdminOverview
  try {
    overview = await serverApiFetch<AdminOverview>('/api/v1/admin/overview')
  } catch (err) {
    redirectIfSignedOut(err, '/admin')
  }

  return (
    <AdminAppShell>
      <p className="cx-label text-navy-400">Welcome back</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Home</h1>

      {overview.role === 'admin' && <AdminOverviewView overview={overview} />}
      {overview.role === 'reviewer_lead' && <ReviewerLeadOverviewView overview={overview} />}
      {overview.role === 'compliance' && <ComplianceOverviewView overview={overview} />}
    </AdminAppShell>
  )
}

function AdminOverviewView({ overview }: { overview: Extract<AdminOverview, { role: 'admin' }> }) {
  return (
    <>
      {/* Hero — an action-items sum, not a personal achievement number: an
          admin's job is triage/oversight across the whole pipeline, not
          individual daily output like QA/Operator. */}
      <div className="mt-6 rounded-xl border border-navy-900 bg-navy-900 p-6 sm:p-8">
        <p className="cx-label text-copper-300">Needs your attention</p>
        <p className="mt-2 font-mono text-4xl font-semibold tracking-tight tabular-nums text-white sm:text-5xl">
          {overview.needsAttention}
        </p>
      </div>

      <div className="cx-card mt-6 grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Link href="/admin/tickets" className="p-5 hover:bg-navy-50">
          <p className="cx-meta text-navy-400">Open tickets</p>
          <p className="cx-stat mt-1 text-navy-900">{overview.openTickets}</p>
        </Link>
        <Link href="/admin/applications" className="p-5 hover:bg-navy-50">
          <p className="cx-meta text-navy-400">Pending applications</p>
          <p className="cx-stat mt-1 text-navy-900">{overview.pendingOperatorApplications}</p>
        </Link>
        <Link href="/admin/payouts" className="p-5 hover:bg-navy-50">
          <p className="cx-meta text-navy-400">Awaiting payout</p>
          <p className="cx-stat mt-1 text-navy-900">{overview.submissionsAwaitingPayout}</p>
        </Link>
      </div>

      <div className="mt-8">
        <p className="cx-label text-navy-400">System state</p>
        <div className="mt-2.5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/campaigns" className="cx-card flex flex-col gap-2 p-5 hover:border-accent/40">
            <Megaphone className="size-4 text-accent" />
            <p className="cx-meta text-navy-400">Campaigns live</p>
            <p className="cx-stat text-navy-900">{overview.campaignsLive}</p>
          </Link>
          <div className="cx-card flex flex-col gap-2 p-5">
            <ListChecks className="size-4 text-accent" />
            <p className="cx-meta text-navy-400">QA backlog</p>
            <p className="cx-stat text-navy-900">{overview.submissionsAwaitingQa}</p>
          </div>
          <div className="cx-card flex flex-col gap-2 p-5">
            <ClipboardList className="size-4 text-accent" />
            <p className="cx-meta text-navy-400">Operator backlog</p>
            <p className="cx-stat text-navy-900">{overview.clientItemsAwaitingReview}</p>
          </div>
          <Link href="/admin/datasets" className="cx-card flex flex-col gap-2 p-5 hover:border-accent/40">
            <Package className="size-4 text-accent" />
            <p className="cx-meta text-navy-400">Datasets</p>
            <p className="cx-meta mt-1 text-navy-500">
              <span className="font-mono font-semibold text-navy-900">{overview.datasetsByStatus.draft}</span> draft
              {' · '}
              <span className="font-mono font-semibold text-navy-900">{overview.datasetsByStatus.sealed}</span>{' '}
              sealed
              {' · '}
              <span className="font-mono font-semibold text-navy-900">{overview.datasetsByStatus.delivered}</span>{' '}
              delivered
            </p>
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <p className="cx-label text-navy-400">Recent activity</p>
        {overview.recentAuditEntries.length === 0 ? (
          <p className="cx-body mt-2.5 text-navy-400">Nothing logged yet.</p>
        ) : (
          <div className="cx-card mt-2.5 divide-y divide-border">
            {overview.recentAuditEntries.map((e) => (
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
    </>
  )
}

function ReviewerLeadOverviewView({ overview }: { overview: Extract<AdminOverview, { role: 'reviewer_lead' }> }) {
  return (
    <Link
      href="/admin/tickets"
      className="cx-card mt-6 flex items-center justify-between gap-4 border-accent/30 bg-accent/5 p-6 hover:bg-accent/10"
    >
      <div>
        <p className="cx-label text-accent">Tickets</p>
        <p className="cx-title mt-0.5 text-navy-900">Open client escalations</p>
      </div>
      <div className="flex items-center gap-4">
        <p className="cx-stat text-navy-900">{overview.openTickets}</p>
        <ArrowRight className="size-5 shrink-0 text-accent" />
      </div>
    </Link>
  )
}

function ComplianceOverviewView({ overview }: { overview: Extract<AdminOverview, { role: 'compliance' }> }) {
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

      <p className="cx-label mt-8 text-navy-400">Recent activity</p>
      {overview.recentAuditEntries.length === 0 ? (
        <p className="cx-body mt-2.5 text-navy-400">Nothing logged yet.</p>
      ) : (
        <div className="cx-card mt-2.5 divide-y divide-border">
          {overview.recentAuditEntries.map((e) => (
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
