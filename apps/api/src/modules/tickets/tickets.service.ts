import { asc, eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { clientTickets, type ClientTicket } from '../../db/schema'
import { writeAuditLog } from '../../lib/audit'
import { HttpError } from '../../middleware/error-handler'

export async function listTickets() {
  return db.query.clientTickets.findMany({
    orderBy: asc(clientTickets.createdAt),
    with: { resolvedByUser: true },
  })
}

export async function resolveTicket(
  ticketId: string,
  resolverId: string,
  resolutionNotes: string | undefined,
): Promise<ClientTicket> {
  const ticket = await db.query.clientTickets.findFirst({ where: eq(clientTickets.id, ticketId) })
  if (!ticket) throw new HttpError(404, 'not_found', 'Ticket not found.')
  if (ticket.status !== 'open') {
    throw new HttpError(409, 'invalid_state', 'This ticket is already resolved.')
  }

  const [updated] = await db
    .update(clientTickets)
    .set({ status: 'resolved', resolvedBy: resolverId, resolvedAt: new Date(), resolutionNotes })
    .where(eq(clientTickets.id, ticketId))
    .returning()

  await writeAuditLog({
    actorId: resolverId,
    actorLabel: resolverId,
    actorRole: 'staff',
    action: 'ticket.resolved',
    resourceType: 'client_ticket',
    resourceId: ticketId,
  })

  return updated
}
