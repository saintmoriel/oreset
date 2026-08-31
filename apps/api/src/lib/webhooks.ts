import crypto from 'node:crypto'
import { eq, and } from 'drizzle-orm'
import { db } from '../db/client'
import { webhookConfigs, clientQueueItems } from '../db/schema'

export type WebhookEvent = 'case.completed' | 'case.escalated' | 'case.consensus_split' | 'case.adjudicated'

function signPayload(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

export async function fireWebhooksForItem(
  itemId: string,
  event: WebhookEvent,
  extra?: Record<string, unknown>,
) {
  const item = await db.query.clientQueueItems.findFirst({
    where: eq(clientQueueItems.id, itemId),
  })
  if (!item || !item.submittedBy) return

  const configs = await db.query.webhookConfigs.findMany({
    where: and(
      eq(webhookConfigs.buyerId, item.submittedBy),
      eq(webhookConfigs.active, true),
    ),
  })

  const matchingConfigs = configs.filter((c) => {
    const events = c.events as string[]
    return events.includes(event) || events.includes('*')
  })

  if (matchingConfigs.length === 0) return

  const payload = JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    data: {
      itemId: item.id,
      externalRef: item.externalRef,
      clientName: item.clientName,
      status: item.status,
      ...extra,
    },
  })

  for (const config of matchingConfigs) {
    const signature = signPayload(payload, config.secret)

    fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Oreset-Signature': signature,
        'X-Oreset-Event': event,
      },
      body: payload,
      signal: AbortSignal.timeout(10_000),
    })
      .then(async (res) => {
        await db
          .update(webhookConfigs)
          .set({
            lastTriggeredAt: new Date(),
            lastStatus: `${res.status} ${res.statusText}`,
            updatedAt: new Date(),
          })
          .where(eq(webhookConfigs.id, config.id))
      })
      .catch(async (err) => {
        await db
          .update(webhookConfigs)
          .set({
            lastTriggeredAt: new Date(),
            lastStatus: `error: ${(err as Error).message}`,
            updatedAt: new Date(),
          })
          .where(eq(webhookConfigs.id, config.id))
      })
  }
}
