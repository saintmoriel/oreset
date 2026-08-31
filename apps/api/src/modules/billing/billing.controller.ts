import crypto from 'node:crypto'
import type { Request, Response } from 'express'
import { z } from 'zod'
import { env } from '../../config/env'
import * as billingService from './billing.service'

const createInvoiceSchema = z.object({
  description: z.string().min(1).max(500),
  amountMinorUnits: z.number().int().positive(),
  currency: z.string().length(3).optional(),
  caseCount: z.number().int().positive().optional(),
})

export async function createInvoice(req: Request, res: Response) {
  const body = createInvoiceSchema.parse(req.body)
  const invoice = await billingService.createInvoice(req.user!.sub, body)
  res.status(201).json({ invoice })
}

export async function myInvoices(req: Request, res: Response) {
  const invoices = await billingService.getMyInvoices(req.user!.sub)
  res.status(200).json({ invoices })
}

export async function myInvoiceStats(req: Request, res: Response) {
  const stats = await billingService.getInvoiceStats(req.user!.sub)
  res.status(200).json(stats)
}

export async function verifyPayment(req: Request, res: Response) {
  const ref = req.query.ref as string
  if (!ref) { res.status(400).json({ error: 'Missing ref' }); return }
  const invoice = await billingService.verifyPayment(ref)
  res.status(200).json({ invoice })
}

export async function paymentCallback(req: Request, res: Response) {
  const ref = req.query.ref as string
  if (ref) await billingService.verifyPayment(ref).catch(() => {})
  res.redirect(302, `/buyer/billing?verified=${ref ?? ''}`)
}

export async function flutterwaveWebhook(req: Request, res: Response) {
  if (env.FLW_WEBHOOK_HASH) {
    const signature = req.headers['verif-hash'] as string
    if (signature !== env.FLW_WEBHOOK_HASH) {
      res.status(401).json({ error: 'Invalid signature' })
      return
    }
  }

  await billingService.handleFlutterwaveWebhook(req.body)
  res.status(200).json({ ok: true })
}
