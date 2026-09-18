import type { Request, Response, NextFunction } from 'express'
import { and, eq, sql } from 'drizzle-orm'
import { db } from '../db/client'
import { operatorAgreements, calibrationAttempts } from '../db/schema'

// An approved tester still cannot touch client scenarios until they have
// signed all three agreements and passed calibration. Runs after
// requireActive. The error body carries the checklist so the UI can show
// exactly what is missing.

export const REQUIRED_AGREEMENTS = 3
export const REQUIRED_CALIBRATION_PASSES = 2

export async function onboardingStatus(userId: string) {
  const [[agreements], [passes]] = await Promise.all([
    db.select({ n: sql<number>`count(distinct ${operatorAgreements.agreementType})::int` })
      .from(operatorAgreements).where(eq(operatorAgreements.userId, userId)),
    db.select({ n: sql<number>`count(*)::int` })
      .from(calibrationAttempts)
      .where(and(eq(calibrationAttempts.operatorId, userId), eq(calibrationAttempts.result, 'pass'))),
  ])
  const agreementsSigned = agreements?.n ?? 0
  const calibrationPassed = passes?.n ?? 0
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
          message: 'Finish onboarding before taking live scenarios: sign all agreements and pass calibration.',
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
