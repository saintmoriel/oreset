import { and, desc, eq, isNull } from 'drizzle-orm'
import { db } from '../../db/client'
import { submissions, users, payouts, type Payout } from '../../db/schema'
import { env } from '../../config/env'
import { writeAuditLog } from '../../lib/audit'
import { DevStubPaymentProvider, type PaymentProvider } from './payment.provider'

// Mirrors auth.service.ts's / uploads.service.ts's one-line provider
// selection — no separate config-file abstraction invented here either.
const paymentProvider: PaymentProvider =
  env.PAYMENT_PROVIDER === 'dev-stub'
    ? new DevStubPaymentProvider()
    : (() => {
        throw new Error(`${env.PAYMENT_PROVIDER} PaymentProvider not implemented yet — set PAYMENT_PROVIDER=dev-stub`)
      })()

export async function getMyPayouts(contributorId: string): Promise<Payout[]> {
  return db.query.payouts.findMany({
    where: eq(payouts.contributorId, contributorId),
    orderBy: desc(payouts.createdAt),
  })
}

export async function setPayoutDetails(
  contributorId: string,
  payoutDetails: Record<string, unknown>,
): Promise<void> {
  await db.update(users).set({ payoutDetails, updatedAt: new Date() }).where(eq(users.id, contributorId))
}

export async function runPayoutBatch(): Promise<{ payoutsCreated: number }> {
  const covered = await db.query.submissions.findMany({
    where: and(eq(submissions.status, 'qa_approved'), isNull(submissions.payoutId)),
    with: { batch: true, contributor: true },
  })

  const eligible = covered.filter((s) => s.contributor.payoutDetails)
  if (eligible.length === 0) return { payoutsCreated: 0 }

  const byContributor = new Map<string, typeof eligible>()
  for (const s of eligible) {
    const list = byContributor.get(s.contributorId) ?? []
    list.push(s)
    byContributor.set(s.contributorId, list)
  }

  // Atomic per-run: creates every payout row and stamps every covered
  // submission's payoutId together, both or neither — same shape as
  // Phase 2's campaign+batch transaction.
  const created = await db.transaction(async (tx) => {
    const rows: Payout[] = []
    for (const [contributorId, subs] of byContributor) {
      const amountMinorUnits = subs.reduce((sum, s) => sum + s.batch.rateMinorUnits, 0)
      const currency = subs[0].batch.currency
      const [payout] = await tx
        .insert(payouts)
        .values({ contributorId, amountMinorUnits, currency, status: 'processing', provider: env.PAYMENT_PROVIDER })
        .returning()

      for (const s of subs) {
        await tx.update(submissions).set({ payoutId: payout.id }).where(eq(submissions.id, s.id))
      }
      rows.push(payout)
    }
    return rows
  })

  // External side-effects never go inside a DB transaction — same
  // principle already applied to writeAuditLog throughout Phases 2-3.
  for (const payout of created) {
    const contributor = byContributor.get(payout.contributorId)![0].contributor
    const result = await paymentProvider.initiatePayout({
      amountMinorUnits: payout.amountMinorUnits,
      currency: payout.currency,
      payoutDetails: contributor.payoutDetails,
    })
    await db
      .update(payouts)
      .set({ status: result.status, providerReference: result.providerReference, updatedAt: new Date() })
      .where(eq(payouts.id, payout.id))

    await writeAuditLog({
      actorId: null,
      actorLabel: 'payouts-svc',
      actorRole: 'System',
      action: `payout.${result.status}`,
      resourceType: 'payout',
      resourceId: payout.id,
      metadata: { contributorId: payout.contributorId, amountMinorUnits: payout.amountMinorUnits },
    })
  }

  return { payoutsCreated: created.length }
}
