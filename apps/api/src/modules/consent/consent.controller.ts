import type { Request, Response } from 'express'
import { z } from 'zod'
import * as consentService from './consent.service'

const recordConsentSchema = z.object({ batchId: z.string().uuid().optional() })

export async function record(req: Request, res: Response) {
  const { batchId } = recordConsentSchema.parse(req.body)
  const record = await consentService.recordConsent({
    contributorId: req.user!.sub,
    batchId,
    ip: req.ip,
  })
  res.status(201).json({ consentRecord: record })
}
