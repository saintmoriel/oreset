import { describe, it, expect } from 'vitest'
import { eq } from 'drizzle-orm'
import { db } from '../src/db/client'
import { users, clientQueueItems, clientTickets } from '../src/db/schema'
import * as operatorService from '../src/modules/operator/operator.service'

describe('operator.service.decide — escalation creates a real ticket', () => {
  it('inserts a client_tickets row when decision is escalated', async () => {
    const [operator] = await db
      .insert(users)
      .values({ role: 'operator', email: 'operator-test@oreset.dev', operatorCode: 'OP-9001', status: 'active' })
      .returning()
    const [item] = await db
      .insert(clientQueueItems)
      .values({ clientName: 'Test Client', externalRef: 'txn_test1', content: 'Some client content' })
      .returning()

    const { decision } = await operatorService.decide({
      itemId: item.id,
      operatorId: operator.id,
      operatorRole: 'operator',
      decision: 'escalated',
      errTag: 'ERR-02',
      severity: 'SEV-1',
      notes: 'Contradictory answer',
    })

    const ticket = await db.query.clientTickets.findFirst({
      where: eq(clientTickets.operatorReviewDecisionId, decision.id),
    })
    expect(ticket).toBeDefined()
    expect(ticket?.status).toBe('open')
    expect(ticket?.clientName).toBe('Test Client')
    expect(ticket?.externalRef).toBe('txn_test1')
    expect(ticket?.errTag).toBe('ERR-02')
    expect(ticket?.severity).toBe('SEV-1')
  })

  it('does not create a ticket for a non-escalated decision', async () => {
    const [operator] = await db
      .insert(users)
      .values({ role: 'operator', email: 'operator-test2@oreset.dev', operatorCode: 'OP-9002', status: 'active' })
      .returning()
    const [item] = await db
      .insert(clientQueueItems)
      .values({ clientName: 'Test Client', externalRef: 'txn_test2', content: 'Some client content' })
      .returning()

    await operatorService.decide({
      itemId: item.id,
      operatorId: operator.id,
      operatorRole: 'operator',
      decision: 'approved',
    })

    const tickets = await db.query.clientTickets.findMany()
    expect(tickets).toHaveLength(0)
  })
})
