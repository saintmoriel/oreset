import crypto from 'node:crypto'
import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from '../../db/client'
import { invoices, users } from '../../db/schema'
import { env } from '../../config/env'
import { writeAuditLog } from '../../lib/audit'
import { HttpError } from '../../middleware/error-handler'
import {
  DevStubBillingProvider,
  FlutterwaveBillingProvider,
  type BillingProvider,
} from '../payouts/payment.provider'

const billingProvider: BillingProvider =
  env.PAYMENT_PROVIDER === 'flutterwave'
    ? new FlutterwaveBillingProvider()
    : new DevStubBillingProvider()

export async function createInvoice(
  buyerId: string,
  input: { description: string; amountMinorUnits: number; currency?: string; caseCount?: number },
) {
  const buyer = await db.query.users.findFirst({ where: eq(users.id, buyerId) })
  if (!buyer) throw new HttpError(404, 'not_found', 'Buyer not found.')

  const reference = `oreset-inv-${crypto.randomBytes(8).toString('hex')}`

  const { paymentLink, providerReference } = await billingProvider.createPaymentLink({
    amountMinorUnits: input.amountMinorUnits,
    currency: input.currency ?? 'NGN',
    customerEmail: buyer.email!,
    description: input.description,
    reference,
    redirectUrl: `${env.API_PUBLIC_URL}/api/v1/billing/callback?ref=${reference}`,
  })

  const [invoice] = await db
    .insert(invoices)
    .values({
      buyerId,
      reference,
      description: input.description,
      amountMinorUnits: input.amountMinorUnits,
      currency: input.currency ?? 'NGN',
      caseCount: input.caseCount,
      paymentLink,
      providerReference,
      provider: env.PAYMENT_PROVIDER,
    })
    .returning()

  await writeAuditLog({
    actorId: buyerId,
    actorLabel: buyerId,
    actorRole: 'buyer',
    action: 'billing.invoice.created',
    resourceType: 'invoice',
    resourceId: invoice.id,
    metadata: { amountMinorUnits: input.amountMinorUnits },
  })

  return invoice
}

export async function getMyInvoices(buyerId: string) {
  return db.query.invoices.findMany({
    where: eq(invoices.buyerId, buyerId),
    orderBy: desc(invoices.createdAt),
  })
}

export async function verifyPayment(reference: string) {
  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.reference, reference),
  })
  if (!invoice) throw new HttpError(404, 'not_found', 'Invoice not found.')
  if (invoice.status === 'paid') return invoice

  const result = await billingProvider.verifyTransaction(reference)

  const newStatus = result.status === 'successful' ? 'paid' as const : result.status === 'failed' ? 'failed' as const : 'pending' as const

  const [updated] = await db
    .update(invoices)
    .set({
      status: newStatus,
      paidAt: newStatus === 'paid' ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoice.id))
    .returning()

  if (newStatus === 'paid') {
    await writeAuditLog({
      actorId: invoice.buyerId,
      actorLabel: invoice.buyerId,
      actorRole: 'buyer',
      action: 'billing.invoice.paid',
      resourceType: 'invoice',
      resourceId: invoice.id,
      metadata: { amountMinorUnits: invoice.amountMinorUnits },
    })
  }

  return updated
}

export async function handleFlutterwaveWebhook(body: Record<string, unknown>) {
  const data = body.data as Record<string, unknown> | undefined
  if (!data?.tx_ref) return

  const reference = data.tx_ref as string
  return verifyPayment(reference)
}

export async function getInvoiceStats(buyerId: string) {
  const all = await db.query.invoices.findMany({
    where: eq(invoices.buyerId, buyerId),
  })

  const total = all.length
  const paid = all.filter((i) => i.status === 'paid').length
  const pending = all.filter((i) => i.status === 'pending').length
  const totalPaidMinorUnits = all
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.amountMinorUnits, 0)

  return { total, paid, pending, totalPaidMinorUnits }
}
