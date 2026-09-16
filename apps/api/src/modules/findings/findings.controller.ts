import type { Request, Response } from 'express'
import { z } from 'zod'
import { AUDITOR_DECISIONS, SEVERITY_LEVELS } from '@oreset/shared'
import * as findingsService from './findings.service'

const verifySchema = z
  .object({
    verdict: z.enum(AUDITOR_DECISIONS),
    adjustedSeverity: z.enum(SEVERITY_LEVELS).optional(),
    reproducible: z.boolean(),
    blastRadius: z.string().max(4000).optional(),
    auditorNotes: z.string().max(8000).optional(),
  })
  .refine((d) => d.verdict !== 'severity_adjusted' || Boolean(d.adjustedSeverity), {
    message: 'adjustedSeverity is required when verdict is severity_adjusted',
    path: ['adjustedSeverity'],
  })

// Lead auditor
export async function queue(_req: Request, res: Response) {
  const findings = await findingsService.getVerificationQueue()
  res.status(200).json({ findings })
}

export async function stats(_req: Request, res: Response) {
  const result = await findingsService.getVerificationStats()
  res.status(200).json(result)
}

export async function detail(req: Request, res: Response) {
  const result = await findingsService.getFindingDetail(req.params.decisionId)
  res.status(200).json(result)
}

export async function verify(req: Request, res: Response) {
  const body = verifySchema.parse(req.body)
  const finding = await findingsService.verifyFinding({
    decisionId: req.params.decisionId,
    auditorId: req.user!.sub,
    auditorRole: req.user!.role,
    ...body,
  })
  res.status(201).json({ finding })
}

// Client
export async function myFindings(req: Request, res: Response) {
  const result = await findingsService.getBuyerFindings(req.user!.sub)
  res.status(200).json(result)
}

export async function markFixed(req: Request, res: Response) {
  const result = await findingsService.markFindingFixed(req.user!.sub, req.params.id)
  res.status(200).json(result)
}
