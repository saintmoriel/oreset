import type { Request, Response } from 'express'
import { z } from 'zod'
import { OPERATOR_DECISIONS, ERR_TAGS, SEVERITY_LEVELS } from '@oreset/shared'
import * as calibrationService from './calibration.service'

const createCaseSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  traceData: z.record(z.unknown()).optional(),
  expectedDecision: z.enum(OPERATOR_DECISIONS),
  expectedErrTag: z.enum(ERR_TAGS).optional(),
  expectedSeverity: z.enum(SEVERITY_LEVELS).optional(),
  expectedOutcome: z.string().optional(),
  explanation: z.string().min(1),
  domain: z.string().optional(),
  language: z.string().optional(),
})

const attemptSchema = z.object({
  calibrationCaseId: z.string().uuid(),
  decision: z.enum(OPERATOR_DECISIONS),
  errTag: z.enum(ERR_TAGS).optional(),
  severity: z.enum(SEVERITY_LEVELS).optional(),
  correctedOutcome: z.string().optional(),
  notes: z.string().optional(),
  reviewTimeMs: z.number().int().positive().optional(),
})

// Admin endpoints
export async function createCase(req: Request, res: Response) {
  const body = createCaseSchema.parse(req.body)
  const created = await calibrationService.createCase({ ...body, createdBy: req.user!.sub })
  res.status(201).json({ calibrationCase: created })
}

export async function listCases(_req: Request, res: Response) {
  const cases = await calibrationService.listCases()
  res.status(200).json({ cases })
}

export async function retireCase(req: Request, res: Response) {
  const updated = await calibrationService.retireCase(req.params.id)
  res.status(200).json({ calibrationCase: updated })
}

export async function stats(_req: Request, res: Response) {
  const data = await calibrationService.getCalibrationStats()
  res.status(200).json(data)
}

// Operator endpoints
export async function nextCase(req: Request, res: Response) {
  const nextCase = await calibrationService.getNextCase(req.user!.sub)
  res.status(200).json({ calibrationCase: nextCase })
}

export async function submitAttempt(req: Request, res: Response) {
  const body = attemptSchema.parse(req.body)
  const result = await calibrationService.submitAttempt({
    ...body,
    operatorId: req.user!.sub,
  })
  res.status(201).json(result)
}

export async function myCalibration(req: Request, res: Response) {
  const data = await calibrationService.getOperatorCalibration(req.user!.sub)
  res.status(200).json(data)
}
