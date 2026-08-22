import type { Request, Response } from 'express'
import { z } from 'zod'
import * as payoutsService from './payouts.service'

const payoutDetailsSchema = z.record(z.string(), z.unknown())

export async function myPayouts(req: Request, res: Response) {
  const items = await payoutsService.getMyPayouts(req.user!.sub)
  res.status(200).json({ payouts: items })
}

export async function setMyPayoutDetails(req: Request, res: Response) {
  const payoutDetails = payoutDetailsSchema.parse(req.body)
  await payoutsService.setPayoutDetails(req.user!.sub, payoutDetails)
  res.status(200).json({ ok: true })
}

export async function runBatch(_req: Request, res: Response) {
  const result = await payoutsService.runPayoutBatch()
  res.status(200).json(result)
}
