import type { Request, Response } from 'express'
import { z } from 'zod'
import { OPERATOR_DECISIONS, ERR_TAGS, SEVERITY_LEVELS, DOCUMENT_TYPES, AGREEMENT_TYPES } from '@oreset/shared'
import * as operatorService from './operator.service'

const decisionSchema = z
  .object({
    decision: z.enum(OPERATOR_DECISIONS),
    errTag: z.enum(ERR_TAGS).optional(),
    severity: z.enum(SEVERITY_LEVELS).optional(),
    notes: z.string().optional(),
    correctedTranscript: z.string().optional(),
    correctedIntent: z.string().optional(),
    correctedOutcome: z.string().optional(),
    reviewTimeMs: z.number().int().positive().optional(),
  })
  .refine((d) => d.decision !== 'escalated' || (Boolean(d.errTag) && Boolean(d.severity)), {
    message: 'errTag and severity are required when decision is escalated',
    path: ['errTag'],
  })

export async function queue(req: Request, res: Response) {
  const items = await operatorService.getQueue(req.user!.sub)
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

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  location: z.string().min(1).max(200).optional(),
  languages: z
    .array(z.object({ language: z.string(), fluency: z.string() }))
    .min(1)
    .optional(),
  dialect: z.string().max(200).optional(),
  academicBackground: z.string().min(1).optional(),
  englishProficiency: z.string().min(1).optional(),
  availability: z.array(z.string()).optional(),
  experience: z.string().max(2000).optional(),
})

export async function getProfile(req: Request, res: Response) {
  const profile = await operatorService.getProfile(req.user!.sub)
  res.status(200).json(profile)
}

export async function updateProfile(req: Request, res: Response) {
  const body = updateProfileSchema.parse(req.body)
  const profile = await operatorService.updateProfile(req.user!.sub, body)
  res.status(200).json(profile)
}

// ---------------------------------------------------------------------------
// Identity Verifications
// ---------------------------------------------------------------------------

const verificationSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPES),
  fileName: z.string().min(1),
  fileUrl: z.string().min(1),
  fileSizeBytes: z.string().optional(),
})

export async function getVerifications(req: Request, res: Response) {
  const result = await operatorService.getVerifications(req.user!.sub)
  res.status(200).json(result)
}

export async function submitVerification(req: Request, res: Response) {
  const body = verificationSchema.parse(req.body)
  const verification = await operatorService.submitVerification(req.user!.sub, body)
  res.status(201).json(verification)
}

// ---------------------------------------------------------------------------
// Agreements
// ---------------------------------------------------------------------------

const signAgreementSchema = z.object({
  agreementType: z.enum(AGREEMENT_TYPES),
})

export async function getAgreements(req: Request, res: Response) {
  const result = await operatorService.getAgreements(req.user!.sub)
  res.status(200).json(result)
}

export async function signAgreement(req: Request, res: Response) {
  const body = signAgreementSchema.parse(req.body)
  const agreement = await operatorService.signAgreement(req.user!.sub, {
    agreementType: body.agreementType,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  })
  res.status(201).json(agreement)
}

// ---------------------------------------------------------------------------
// Payout Details
// ---------------------------------------------------------------------------

const operatorPayoutDetailsSchema = z.object({
  country: z.string().min(1),
  bankName: z.string().min(1),
  accountNumber: z.string().min(1),
  accountName: z.string().min(1),
})

export async function getPayoutDetails(req: Request, res: Response) {
  const result = await operatorService.getPayoutDetails(req.user!.sub)
  res.status(200).json(result)
}

export async function updatePayoutDetails(req: Request, res: Response) {
  const body = operatorPayoutDetailsSchema.parse(req.body)
  const result = await operatorService.updatePayoutDetails(req.user!.sub, body)
  res.status(200).json(result)
}
