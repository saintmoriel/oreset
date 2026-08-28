import type { Request, Response } from 'express'
import { z } from 'zod'
import { QA_DECISIONS, ERR_TAGS } from '@oreset/shared'
import * as qaService from './qa.service'

const decisionSchema = z
  .object({
    decision: z.enum(QA_DECISIONS),
    defectTag: z.enum(ERR_TAGS).optional(),
    notes: z.string().optional(),
  })
  .refine((d) => d.decision !== 'rejected' || Boolean(d.defectTag), {
    message: 'defectTag is required when decision is rejected',
    path: ['defectTag'],
  })

export async function queue(_req: Request, res: Response) {
  const items = await qaService.getQueue()
  res.status(200).json({ items })
}

export async function myStats(req: Request, res: Response) {
  const stats = await qaService.getMyStats(req.user!.sub)
  res.status(200).json(stats)
}

export async function myDecisions(req: Request, res: Response) {
  const decisions = await qaService.getMyDecisions(req.user!.sub)
  res.status(200).json({ decisions })
}

export async function decide(req: Request, res: Response) {
  const body = decisionSchema.parse(req.body)
  const result = await qaService.decide({
    submissionId: req.params.submissionId,
    reviewerId: req.user!.sub,
    reviewerRole: req.user!.staffRole,
    ...body,
  })
  res.status(200).json(result)
}
