import { Lock } from 'lucide-react'
import { AdminAppShell } from '@/components/admin/admin-app-shell'
import { TicketResolveClient } from '@/components/admin/ticket-resolve-client'
import { StatusTag } from '@/components/capture/status-tag'
import { serverApiFetch } from '@/lib/api/server'
import type { AuthUser } from '@oreset/shared'
import type { Ticket } from '@/lib/api/endpoints/tickets'

export default async function TicketsPage() {
  const { user } = await serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me')
  const role = user.staffRole!
  const canView = role === 'admin' || role === 'reviewer_lead'

  const tickets = canView
    ? (await serverApiFetch<{ tickets: Ticket[] }>('/api/v1/admin/tickets')).tickets
    : []

  return (
    <AdminAppShell>
      <p className="cx-label text-navy-400">Operators · Oversight</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Client tickets</h1>
      <p className="cx-body mt-2 max-w-lg text-navy-500">
        Where a Certified Operator&apos;s Escalate decision actually lands — real client output
        flagged for follow-up.
      </p>

      {!canView ? (
        <div className="cx-card mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-navy-100">
            <Lock className="size-5 text-navy-400" />
          </span>
          <p className="cx-body font-semibold text-navy-900">Access restricted</p>
          <p className="cx-meta max-w-sm text-navy-500">
            Your role cannot view client tickets. Admin and Reviewer Lead only.
          </p>
        </div>
      ) : tickets.length === 0 ? (
        <p className="cx-body mt-6 text-navy-400">No tickets yet.</p>
      ) : (
        <div className="cx-card mt-6 divide-y divide-border">
          {tickets.map((t) => (
            <div key={t.id} className="flex items-start justify-between gap-4 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="cx-mono-meta font-semibold text-navy-800">{t.externalRef}</p>
                  {t.errTag && <span className="cx-mono-meta font-semibold text-accent">{t.errTag}</span>}
                  {t.severity && <span className="cx-mono-meta text-navy-400">{t.severity}</span>}
                </div>
                <p className="cx-mono-meta mt-1 text-navy-400">{t.clientName}</p>
                {t.notes && <p className="cx-body mt-2 text-navy-800">{t.notes}</p>}
                {t.status === 'resolved' && t.resolutionNotes && (
                  <p className="cx-meta mt-2 text-success">Resolved: {t.resolutionNotes}</p>
                )}
              </div>
              {t.status === 'open' ? (
                <TicketResolveClient ticketId={t.id} />
              ) : (
                <StatusTag tone="success">Resolved</StatusTag>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminAppShell>
  )
}
