import { desc, eq, sql } from 'drizzle-orm'
import { db } from '../../db/client'
import { leads } from '../../db/schema'
import { env } from '../../config/env'
import { sendMail } from '../../lib/mail'
import { writeAuditLog } from '../../lib/audit'
import { HttpError } from '../../middleware/error-handler'

export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'closed'] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]

export async function createLead(input: {
  kind: 'pilot' | 'contact'
  name: string
  email: string
  organization?: string
  agentType?: string
  languages?: string
  audience?: string
  message: string
  sourcePath?: string
  userAgent?: string
}) {
  const [lead] = await db.insert(leads).values(input).returning()

  // Announce to the team and acknowledge to the sender. Neither blocks the
  // response: the lead is already saved, which is the part that matters.
  const summary = [
    `Kind: ${input.kind}`,
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    input.organization ? `Organisation: ${input.organization}` : null,
    input.agentType ? `Agent type: ${input.agentType}` : null,
    input.languages ? `Languages: ${input.languages}` : null,
    input.audience ? `Audience: ${input.audience}` : null,
    '',
    input.message,
    '',
    `Open in admin: ${env.WEB_PUBLIC_URL}/admin/leads`,
  ].filter((l) => l !== null).join('\n')

  if (env.LEADS_NOTIFY_EMAIL) {
    void sendMail({
      to: env.LEADS_NOTIFY_EMAIL,
      subject: `New ${input.kind === 'pilot' ? 'early access request' : 'contact'}: ${input.name}${input.organization ? `, ${input.organization}` : ''}`,
      text: summary,
      replyTo: input.email,
    })
  }
  void sendMail({
    to: input.email,
    subject: 'We received your request',
    text: [
      `Hi ${input.name.split(' ')[0]},`,
      '',
      'Thanks for reaching out to Oreset. A person on the team has your request and will reply, usually within one working day.',
      '',
      'If it is urgent, reply to this email.',
      '',
      'Oreset',
      env.WEB_PUBLIC_URL,
    ].join('\n'),
  })

  return lead
}

export async function listLeads(status?: string) {
  return db.query.leads.findMany({
    where: status && status !== 'all' ? eq(leads.status, status) : undefined,
    orderBy: desc(leads.createdAt),
    limit: 500,
  })
}

export async function countNewLeads() {
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(leads).where(eq(leads.status, 'new'))
  return row?.n ?? 0
}

export async function updateLead(
  actor: { id: string; role: string },
  leadId: string,
  input: { status?: LeadStatus; notes?: string },
) {
  const existing = await db.query.leads.findFirst({ where: eq(leads.id, leadId) })
  if (!existing) throw new HttpError(404, 'not_found', 'Lead not found.')

  const [updated] = await db
    .update(leads)
    .set({
      ...(input.status ? { status: input.status, handledBy: actor.id, handledAt: new Date() } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    })
    .where(eq(leads.id, leadId))
    .returning()

  await writeAuditLog({
    actorId: actor.id,
    actorLabel: actor.id,
    actorRole: actor.role,
    action: 'lead.updated',
    resourceType: 'lead',
    resourceId: leadId,
    metadata: input,
  })

  return updated
}
