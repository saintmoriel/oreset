import type { Request, Response } from 'express'
import { z } from 'zod'
import { OPERATOR_DECISIONS, ERR_TAGS, SEVERITY_LEVELS } from '@oreset/shared'
import * as operatorService from './operator.service'

const decisionSchema = z
  .object({
    decision: z.enum(OPERATOR_DECISIONS),
    errTag: z.enum(ERR_TAGS).optional(),
    severity: z.enum(SEVERITY_LEVELS).optional(),
    notes: z.string().optional(),
  })
  .refine((d) => d.decision !== 'escalated' || (Boolean(d.errTag) && Boolean(d.severity)), {
    message: 'errTag and severity are required when decision is escalated',
    path: ['errTag'],
  })

export async function queue(_req: Request, res: Response) {
  const items = await operatorService.getQueue()
  res.status(200).json({ items })
}

export async function myStats(req: Request, res: Response) {
  const stats = await operatorService.getMyStats(req.user!.sub)
  res.status(200).json(stats)
}

export async function myDecisions(req: Request, res: Response) {
  const decisions = await operatorService.getMyDecisions(req.user!.sub)
  res.status(200).json({ decisions })
}

export async function decide(req: Request, res: Response) {
  const body = decisionSchema.parse(req.body)
  const result = await operatorService.decide({
    itemId: req.params.id,
    operatorId: req.user!.sub,
    operatorRole: req.user!.role,
    ...body,
  })
  res.status(200).json(result)
}
