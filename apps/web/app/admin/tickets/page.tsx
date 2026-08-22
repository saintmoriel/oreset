import { Lock, TriangleAlert } from 'lucide-react'
import { AdminShell } from '@/components/admin/admin-shell'
import { TicketResolveClient } from '@/components/admin/ticket-resolve-client'
import { cn } from '@/lib/utils'
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
    <AdminShell role={role}>
      <div>
        <p className="text-eyebrow text-accent">Operators · Oversight</p>
        <h1 className="text-h2 mt-2 text-foreground">Client tickets</h1>
        <p className="text-body-sm mt-2 max-w-lg text-muted-foreground">
          Where a Certified Operator's Escalate decision actually lands — real client output flagged
          for follow-up.
        </p>

        {!canView ? (
          <div className="card-surface mt-6 flex flex-col items-center gap-3 p-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-muted">
              <Lock className="size-5 text-muted-foreground" />
            </span>
            <p className="text-body font-semibold text-foreground">Access restricted</p>
            <p className="text-body-sm max-w-sm text-muted-foreground">
              Your role cannot view client tickets. Admin and Reviewer Lead only.
            </p>
          </div>
        ) : tickets.length === 0 ? (
          <p className="mt-6 text-body-sm text-muted-foreground">No tickets yet.</p>
        ) : (
          <ul className="mt-6 divide-y divide-border/70 border-y border-border/70">
            {tickets.map((t) => (
              <li key={t.id} className="flex items-start justify-between gap-4 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    {t.status === 'open' && <TriangleAlert className="size-4 text-warning" />}
                    <p className="font-mono text-body-sm font-medium text-foreground">{t.externalRef}</p>
                    {t.errTag && (
                      <span className="font-mono text-caption font-semibold text-accent">{t.errTag}</span>
                    )}
                    {t.severity && <span className="text-caption text-muted-foreground">{t.severity}</span>}
                  </div>
                  <p className="text-caption mt-1 text-muted-foreground">{t.clientName}</p>
                  {t.notes && <p className="text-body-sm mt-2 text-foreground">{t.notes}</p>}
                  {t.status === 'resolved' && t.resolutionNotes && (
                    <p className="text-caption mt-2 text-success">Resolved: {t.resolutionNotes}</p>
                  )}
                </div>
                {t.status === 'open' ? (
                  <TicketResolveClient ticketId={t.id} />
                ) : (
                  <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-caption font-semibold', 'bg-success/10 text-success')}>
                    Resolved
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminShell>
  )
}
