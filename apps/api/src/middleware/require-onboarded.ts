import type { Request, Response, NextFunction } from 'express'
import { and, eq } from 'drizzle-orm'
import { db } from '../db/client'
import { operatorAgreements, calibrationAttempts } from '../db/schema'
import { AGREEMENT_DOCUMENTS, AGREEMENT_ORDER } from '../modules/operator/agreement-texts'

// An approved tester still cannot touch client scenarios until they have
// accepted every agreement at its current version and passed calibration.
// Runs after requireActive. The error body carries the checklist so the UI
// can show exactly what is missing.

export const REQUIRED_AGREEMENTS = AGREEMENT_ORDER.length
export const REQUIRED_CALIBRATION_PASSES = 2

export async function onboardingStatus(userId: string) {
  const [agreements, passes] = await Promise.all([
    db.query.operatorAgreements.findMany({
      where: eq(operatorAgreements.userId, userId),
      columns: { agreementType: true, version: true },
    }),
    db.query.calibrationAttempts.findMany({
      where: and(eq(calibrationAttempts.operatorId, userId), eq(calibrationAttempts.result, 'pass')),
      columns: { id: true },
    }),
  ])
  // Only an acceptance of the current version counts.
  const agreementsSigned = AGREEMENT_ORDER.filter((type) =>
    agreements.some((a) => a.agreementType === type && a.version === AGREEMENT_DOCUMENTS[type].version),
  ).length
  const calibrationPassed = passes.length
  return {
    agreementsSigned,
    agreementsRequired: REQUIRED_AGREEMENTS,
    calibrationPassed,
    calibrationRequired: REQUIRED_CALIBRATION_PASSES,
    complete: agreementsSigned >= REQUIRED_AGREEMENTS && calibrationPassed >= REQUIRED_CALIBRATION_PASSES,
  }
}

export async function requireOnboarded(req: Request, res: Response, next: NextFunction) {
  try {
    const status = await onboardingStatus(req.user!.sub)
    if (!status.complete) {
      res.status(403).json({
        error: {
          code: 'onboarding_incomplete',
          message: 'Finish onboarding before taking live scenarios: accept all agreements and pass calibration.',
          details: status,
        },
      })
      return
    }
    next()
  } catch (err) {
    next(err)
  }
}
