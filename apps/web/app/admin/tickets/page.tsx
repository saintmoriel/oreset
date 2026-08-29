import { Lock, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { AdminAppShell } from '@/components/admin/admin-app-shell'
import { TicketResolveClient } from '@/components/admin/ticket-resolve-client'
import { TicketFilters } from '@/components/admin/ticket-filters'
import { StatusTag } from '@/components/capture/status-tag'
import { serverApiFetch } from '@/lib/api/server'
import { ERR_TAG_LABELS } from '@oreset/shared'
import type { AuthUser, ErrTag } from '@oreset/shared'
import type { Ticket } from '@/lib/api/endpoints/tickets'

export default async function TicketsPage() {
  const { user } = await serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me')
  const role = user.staffRole!
  const canView = role === 'admin' || role === 'reviewer_lead'

  const tickets = canView
    ? (await serverApiFetch<{ tickets: Ticket[] }>('/api/v1/admin/tickets')).tickets
    : []

  const openCount = tickets.filter((t) => t.status === 'open').length
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length

  return (
    <AdminAppShell>
      <p className="cx-label text-navy-400">Senior QA · Adjudication</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Escalation Queue</h1>
      <p className="cx-body mt-2 max-w-lg text-navy-500">
        Cases escalated by operators for ambiguous context, novel slang, or unclear policy.
        Review the original evidence and resolve or re-route.
      </p>

      {!canView ? (
        <div className="cx-card mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-navy-100">
            <Lock className="size-5 text-navy-400" />
          </span>
          <p className="cx-body font-semibold text-navy-900">Access restricted</p>
          <p className="cx-meta max-w-sm text-navy-500">
            Admin and Reviewer Lead roles only.
          </p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-warning/10">
                <AlertTriangle className="size-5 text-warning" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">{openCount}</p>
                <p className="cx-meta text-navy-400">Open</p>
              </div>
            </div>
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle2 className="size-5 text-success" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">{resolvedCount}</p>
                <p className="cx-meta text-navy-400">Resolved</p>
              </div>
            </div>
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-navy-100">
                <Clock className="size-5 text-navy-500" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">{tickets.length}</p>
                <p className="cx-meta text-navy-400">Total</p>
              </div>
            </div>
          </div>

          {tickets.length === 0 ? (
            <p className="cx-body mt-6 text-navy-400">No escalated tickets yet.</p>
          ) : (
            <TicketFilters tickets={tickets} />
          )}
        </>
      )}
    </AdminAppShell>
  )
}
