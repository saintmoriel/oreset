import type { Request, Response } from 'express'
import { z } from 'zod'
import { OPERATOR_DECISIONS, ERR_TAGS, SEVERITY_LEVELS, CONSENSUS_STATUSES } from '@oreset/shared'
import * as consensusService from './consensus.service'

const adjudicateSchema = z.object({
  finalDecision: z.enum(OPERATOR_DECISIONS),
  finalErrTag: z.enum(ERR_TAGS).optional(),
  finalSeverity: z.enum(SEVERITY_LEVELS).optional(),
  notes: z.string().optional(),
})

export async function stats(req: Request, res: Response) {
  const result = await consensusService.getConsensusStats()
  res.status(200).json(result)
}

export async function adjudicationQueue(req: Request, res: Response) {
  const pairs = await consensusService.getAdjudicationQueue()
  res.status(200).json({ pairs })
}

export async function listPairs(req: Request, res: Response) {
  const status = req.query.status as string | undefined
  const pairs = await consensusService.listPairs(status)
  res.status(200).json({ pairs })
}

export async function adjudicate(req: Request, res: Response) {
  const body = adjudicateSchema.parse(req.body)
  const result = await consensusService.adjudicate({
    pairId: req.params.id,
    adjudicatorId: req.user!.sub,
    adjudicatorRole: req.user!.role,
    ...body,
  })
  res.status(200).json(result)
}

export async function enableDualSolve(req: Request, res: Response) {
  const item = await consensusService.enableDualSolve(req.params.id)
  res.status(200).json({ item })
}

export async function enableDualSolveBulk(req: Request, res: Response) {
  const result = await consensusService.enableDualSolveBulk()
  res.status(200).json(result)
}
